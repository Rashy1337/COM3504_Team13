const plantsModel = require('../models/plants');
var User = require('../models/user');
const axios = require('axios');

exports.create = function(plantsData, filePath, username) {
    User.findOne({ username: username })
        .then(user => {
            if (!user) throw new Error('User not found');

            let plant = new plantsModel({
                plantName: plantsData.plantName,
                dateTime: plantsData.dateTime,
                plantSize: plantsData.plantSize,
                plantCharacteristics: plantsData.plantCharacteristics,
                plantPhoto: filePath, // Use filePath from arguments
                url: plantsData.url,
                address: plantsData.address,
                location: plantsData.location,
                username: user.username
            });

            return plant.save().then(plant => {
                console.log(plant);

                return JSON.stringify(plant);
            }).catch((err) => {
                console.log(err);
                return null;
            });
        })
        .catch(err => {
            console.error(err);
            // Handle error here, for example, render an error page
        });
};

exports.getAll = function(sort) {
    console.log('Sort value in controller:', sort);
    let sortOptions = {};
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
            sortOptions.address = 1;
            break;
    }
    return plantsModel.find({}).sort(sortOptions).then(plants => {
        // console.log(plants);
        return JSON.stringify(plants);
    }).catch(err => {
        console.log(err);
        return null;
    });
};


exports.getPlant = function(plantName) {
    // Capitalize first letter and make the rest lowercase for DBpedia query
    let dbpediaPlantName = plantName.charAt(0).toUpperCase() + plantName.slice(1).toLowerCase();

    return plantsModel.findOne({ plantName: plantName }).then(plant => {
        let plantObject = plant.toObject();
        let dbpediaUrl = `http://dbpedia.org/sparql`;

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

        return axios.get(dbpediaUrl, configComment)
            .then(response => {
                let data = response.data;
                if (data.results.bindings.length > 0) {
                    let comment = data.results.bindings[0].comment.value;
                    plantObject.description = comment;
                } else {
                    plantObject.description = "DBpedia did not manage to get any information about this plant";
                }

                return axios.get(dbpediaUrl, configTaxon)
                    .then(response => {
                        let data = response.data;
                        if (data.results.bindings.length > 0) {
                            let taxon = data.results.bindings[0].taxon.value;
                            plantObject.taxon = taxon;
                        } else {
                            plantObject.taxon = "Taxon not found";
                        }

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