document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('plantForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const form = event.target;

        const plantName = form.plantName.value;
        const dateTime = form.dateTime.value;
        const plantSize = form.plantSize.value;
        const plantIdentification = form.plantIdentification.value;
        const sunExposure = form.sunExposure.value;
        const descriptions = form.descriptions.value;
        const colour = form.colour.value;
        const address = form.address.value;
        const username = form.username.value;

        const plantCharacteristics = {
            hasFlower: form.hasFlower.checked,
            hasSeed: form.hasSeed.checked,
            isFruit: form.isFruit.checked
        };

        let plantPhoto = null;
        const fileInput = form.plantPhoto;
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = async function(event) {
                plantPhoto = event.target.result;
                const plant = {
                    plantName,
                    dateTime,
                    plantSize,
                    plantCharacteristics,
                    plantIdentification,
                    sunExposure,
                    descriptions,
                    colour,
                    plantPhoto,
                    address,
                    location: JSON.parse(form.location.value),
                    username
                };
                console.log('Plant:', plant);
                await handlePlantSubmission(plant);
            };
            reader.readAsDataURL(file);
        } else {
            const plant = {
                plantName,
                dateTime,
                plantSize,
                plantCharacteristics,
                plantIdentification,
                sunExposure,
                descriptions,
                colour,
                plantPhoto,
                address,
                location: JSON.parse(form.location.value),
                username
            };
            console.log('Plant:', plant);
            await handlePlantSubmission(plant);
        }
    });
});

async function handlePlantSubmission(plant) {
    if (navigator.onLine) {
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(plant)
            });

            if (response.ok) {
                alert('Plant details saved to the server.');
                window.location.href = '/';  // Redirect after saving
            } else {
                throw new Error('Failed to save plant details to the server.');
            }
        } catch (error) {
            console.error('Error saving plant details:', error);
            alert('Error saving plant details to the server.');
        }
    } else {
        try {
            await addItem(plant);  // Store the plant object in IndexedDB
            alert('Plant details saved locally.');
            window.location.href = '/';  // Redirect after saving
        } catch (error) {
            console.error('Error saving plant details:', error);
            alert('Error saving plant details locally.');
        }
    }
}

async function addItem(plant) {
    const db = await openDB('PlantFindrDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('plants')) {
                db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
            }
        }
    });

    const tx = db.transaction('plants', 'readwrite');
    await tx.objectStore('plants').add(plant);
    await tx.done;
}

async function openDB(name, version, { upgrade }) {
    return idb.openDB(name, version, { upgrade });
}
