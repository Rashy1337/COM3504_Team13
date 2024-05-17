const addNewPlantButtonEventListener = () => {
    const plantName = document.getElementById("plantName").value;
    openPlantsIDB().then((db) => {
        const plantData = {
            _id: Date.now().toString(), // Assuming _id is a string. Adjust as necessary.
            plantName: plantName,
            // Add other plant properties here as needed, e.g., dateTime, plantSize, etc.
        };
        addNewPlantToIDB(db, plantData);
    });
    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Plant App",
                {body: "New plant added! - " + plantName})
                .then(r =>
                    console.log(r)
                );
        });
}

window.onload = function () {
    // Add event listeners to buttons
    const addBtn = document.getElementById("add_btn");
    if (addBtn) {
        addBtn.addEventListener("click", addNewPlantButtonEventListener);
    }
}