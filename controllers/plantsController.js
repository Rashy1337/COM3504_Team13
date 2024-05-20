const plantsModel = require('../models/plants');
var User = require('../models/user');
const axios = require('axios');

// Function to create a new plant entry
exports.create = function(plantsData, base64Image, username) {
    // Find the user by username
    return User.findOne({ username: username })
        .then(user => {
            if (!user) throw new Error('User not found');

            // Create a new plant object with provided data
            let plant = new plantsModel({
                plantName: plantsData.plantName,
                dateTime: plantsData.dateTime,
                plantSize: plantsData.plantSize,
                plantCharacteristics: {
                    hasFlower: plantsData.hasFlower === 'Yes',
                    hasSeed: plantsData.hasSeed === 'Yes',
                    isFruit: plantsData.isFruit === 'Yes'
                },
                plantIdentification: plantsData.plantIdentification,
                sunExposure: plantsData.sunExposure,
                colour: plantsData.colour,
                descriptions: plantsData.descriptions,
                plantPhoto: base64Image, // Save the Base64 image string
                address: plantsData.address,
                location: plantsData.location,
                username: user.username
            });

            // Save the new plant entry
            return plant.save().then(plant => {
                // Return JSON stringified plant data
                return JSON.stringify(plant);
            }).catch((err) => {
                console.log(err);
                return null;
            });
        })
        .catch(err => {
            console.error(err);
        });
};

// Function to update plant name
exports.updatePlantName = async function(plantID, newName) {
    try {
        const plant = await plantsModel.findById(plantID);
        if (!plant) {
            throw new Error('Plant not found');
        }

        // Update plant name
        plant.plantName = newName;
        await plant.save();

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
};

// Function to get all plants with optional sorting and filtering by username
exports.getAll = function(sort, username) {
    let sortOptions = {};
    // Apply sorting based on sort parameter
    switch (sort) {
        case 'name-asc':
            sortOptions.plantName = 1;
            break;
        case 'name-desc':
            sortOptions.plantName = -1;
            break;
        case 'date':
            sortOptions.dateTime = 1;
            break;
        case 'location':
            // When sorting by location, find the user and use their location as the center point
            return User.findOne({ username: username })
                .then(user => {
                    if (!user) throw new Error('User not found');
                    return plantsModel.aggregate([
                        {
                            $geoNear: {
                                near: user.location,
                                distanceField: "dist.calculated",
                                maxDistance: 10000000,
                                spherical: true
                            }
                        }
                    ]).then(plants => {
                        return plants;
                    }).catch(err => {
                        console.log(err);
                        return null;
                    });
                })
                .catch(err => {
                    console.error(err);
                });
    }
    // Return plants sorted according to sortOptions
    return plantsModel.find({}).sort(sortOptions).then(plants => {
        return plants;
    }).catch(err => {
        console.log(err);
        return null;
    });
};

// Function to get detailed information about a specific plant
exports.getPlant = function(plantName) {
    // Capitalize first letter and make the rest lowercase for DBpedia query
    let dbpediaPlantName = plantName.split(' ')[0];
    dbpediaPlantName = dbpediaPlantName.charAt(0).toUpperCase() + dbpediaPlantName.slice(1).toLowerCase();

    return plantsModel.findOne({ plantName: plantName }).then(plant => {
        let plantObject = plant.toObject();
        let dbpediaUrl = `http://dbpedia.org/sparql`;

        // SPARQL queries to fetch additional plant information from DBpedia
        let sparqlQueryComment = `
        SELECT ?comment WHERE {
            <http://dbpedia.org/resource/${encodeURIComponent(dbpediaPlantName)}> rdfs:comment ?comment .
            FILTER (lang(?comment) = 'en')
        }`;

        let sparqlQueryTaxon = `
        SELECT ?taxon WHERE {
            <http://dbpedia.org/resource/${encodeURIComponent(dbpediaPlantName)}> dbp:taxon ?taxon .
        }`;

        let sparqlQueryUri = `
        SELECT ?plantUri WHERE {
            BIND(<http://dbpedia.org/resource/${encodeURIComponent(dbpediaPlantName)}> AS ?plantUri)
        }`;

        let configComment = {
            params: {
                query: sparqlQueryComment,
                format: 'json'
            }
        };

        let configTaxon = {
            params: {
                query: sparqlQueryTaxon,
                format: 'json'
            }
        };

        let configUri = {
            params: {
                query: sparqlQueryUri,
                format: 'json'
            }
        };

        // Fetch plant comment from DBpedia
        return axios.get(dbpediaUrl, configComment)
            .then(response => {
                let data = response.data;
                if (data.results.bindings.length > 0) {
                    let comment = data.results.bindings[0].comment.value;
                    plantObject.description = comment;
                } else {
                    plantObject.description = "DBpedia did not manage to get any information about this plant";
                }

                // Fetch plant taxon from DBpedia
                return axios.get(dbpediaUrl, configTaxon)
                    .then(response => {
                        let data = response.data;
                        if (data.results.bindings.length > 0) {
                            let taxon = data.results.bindings[0].taxon.value;
                            plantObject.taxon = taxon;
                        } else {
                            plantObject.taxon = "Taxon not found";
                        }

                        // Fetch plant URI from DBpedia
                        return axios.get(dbpediaUrl, configUri)
                            .then(response => {
                                let data = response.data;
                                if (data.results.bindings.length > 0) {
                                    let plantUri = data.results.bindings[0].plantUri.value;
                                    plantObject.plantUri = plantUri;
                                } else {
                                    plantObject.plantUri = "Plant URI not found";
                                }

                                return plantObject;
                            })
                            .catch(error => {
                                console.error(error);
                                return plantObject;
                            });
                    })
                    .catch(error => {
                        console.error(error);
                        return plantObject;
                    });
            })
            .catch(error => {
                console.error(error);
                return plantObject;
            });
    }).catch(err => {
        console.log(err);
        return null;
    });
}
