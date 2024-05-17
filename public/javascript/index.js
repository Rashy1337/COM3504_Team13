// Function to insert a plant item into the list
const insertPlantInList = (plant) => {
    if (plant.plantName) {
        const copy = document.getElementById("plant_template").cloneNode(true);
        copy.removeAttribute("id"); // otherwise this will be hidden as well
        copy.querySelector(".plant-name").innerText = plant.plantName;
        copy.querySelector(".plant-date").innerText = new Date(plant.dateTime).toLocaleDateString();
        copy.querySelector(".plant-size").innerText = plant.plantSize;
        copy.setAttribute("data-plant-id", plant._id);

        // Insert sorted on plant name order - ignoring case
        const plantlist = document.getElementById("plant_list");
        const children = plantlist.querySelectorAll("li[data-plant-id]");
        let inserted = false;
        for (let i = 0; (i < children.length) && !inserted; i++) {
            const child = children[i];
            const copy_name = copy.querySelector(".plant-name").innerText.toUpperCase();
            const child_name = child.querySelector(".plant-name").innerText.toUpperCase();
            if (copy_name < child_name) {
                plantlist.insertBefore(copy, child);
                inserted = true;
            }
        }
        if (!inserted) { // Append child
            plantlist.appendChild(copy);
        }
    }
}

window.onload = function () {
    // Register service worker and other initializations...

    if (navigator.onLine) {
        fetch('/api/plants')
            .then(function (res) {
                return res.json();
            }).then(function (newPlants) {
            openPlantsIDB().then((db) => {
                insertPlantInList(db, newPlants);
                deleteAllExistingPlantsFromIDB(db).then(() => {
                    addNewPlantToIDB(db, newPlants).then(() => {
                        console.log("All new plants added to IDB");
                    });
                });
            });
        });
    } else {
        console.log("Offline mode");
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                for (const plant of plants) {
                    insertPlantInList(plant);
                }
            });
        });
    }
}