const plantsModel = require('../models/plants');
const axios = require('axios');

exports.create = function(plantsData, filePath) {
    let plant = new plantsModel({
        plantName: plantsData.plantName,
        dateTime: plantsData.dateTime,
        plantSize: plantsData.plantSize,
        plantCharacteristics: plantsData.plantCharacteristics,
        plantPhoto: filePath, // Use filePath from arguments
        url: plantsData.url,
        address: plantsData.address
    });

    return plant.save().then(plant => {
        console.log(plant);

        return JSON.stringify(plant);
    }).catch((err) => {
        console.log(err);
        return null;
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
        console.log(plants);
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
        let sparqlQuery = `
            SELECT ?comment WHERE {
                <http://dbpedia.org/resource/${encodeURIComponent(dbpediaPlantName)}> rdfs:comment ?comment .
                FILTER (lang(?comment) = 'en')
            }
        `;
        let config = {
            params: {
                query: sparqlQuery,
                format: 'json'
            }
        };
        return axios.get(dbpediaUrl, config)
            .then(response => {
                let data = response.data;
                if (data.results.bindings.length > 0) {
                    let comment = data.results.bindings[0].comment.value;
                    plantObject.description = comment;
                } else {
                    plantObject.description = "DBpedia did not manage to get any information about this plant";
                }
                return plantObject;
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
