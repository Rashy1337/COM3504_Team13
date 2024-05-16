// Open a connection to the IndexedDB for plants
function openPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PlantDB", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target.errorCode}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('plants')) {
                db.createObjectStore('plants', {keyPath: '_id'});
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
    });
}

// Add new plant to IndexedDB
function addNewPlantToIDB(plantIDB, plantData) {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");
        const addRequest = plantStore.add(plantData);

        addRequest.onsuccess = () => {
            console.log("Plant added with ID:", addRequest.result);
            resolve(addRequest.result);
        };

        addRequest.onerror = (event) => {
            console.error("Add plant error:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Get all plants from IndexedDB
function getAllPlants(plantIDB) {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readonly");
        const plantStore = transaction.objectStore("plants");
        const getAllRequest = plantStore.getAll();

        getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
        };

        getAllRequest.onerror = (event) => {
            console.error("Get all plants error:", event.target.error);
            reject(event.target.error);
        };
    });
}

// Delete all plants from IndexedDB
function deleteAllExistingPlantsFromIDB(plantIDB) {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");
        const clearRequest = plantStore.clear();

        clearRequest.onsuccess = () => {
            console.log("All plants deleted from IDB");
            resolve();
        };

        clearRequest.onerror = (event) => {
            console.error("Delete all plants error:", event.target.error);
            reject(event.target.error);
        };
    });
}