// When the DOM content is loaded, execute this function
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the plantForm on submit
    document.getElementById('plantForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const form = event.target; // Get the form element

        // Extract plant details from the form
        const plantName = form.plantName.value;
        const dateTime = form.dateTime.value;
        const plantSize = form.plantSize.value;
        const plantIdentification = form.plantIdentification.value;
        const sunExposure = form.sunExposure.value;
        const descriptions = form.descriptions.value;
        const colour = form.colour.value;
        const address = form.address.value;
        const username = form.username.value;

        // Extract plant characteristics from checkboxes
        const plantCharacteristics = {
            hasFlower: form.hasFlower.checked,
            hasSeed: form.hasSeed.checked,
            isFruit: form.isFruit.checked
        };

        let plantPhoto = null; // Initialize plantPhoto variable

        // Check if a plant photo is uploaded
        const fileInput = form.plantPhoto;
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0]; // Get the uploaded file
            const reader = new FileReader(); // Initialize FileReader to read the file

            // Once the file is loaded, set the plantPhoto variable and handle plant submission
            reader.onload = async function(event) {
                plantPhoto = event.target.result; // Set plantPhoto to base64 data URL
                const plant = { // Create plant object
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
                console.log('Plant:', plant); // Log the plant object
                await handlePlantSubmission(plant); // Handle plant submission
            };
            reader.readAsDataURL(file); // Read the uploaded file as a data URL
        } else {
            const plant = { // Create plant object
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
            console.log('Plant:', plant); // Log the plant object
            await handlePlantSubmission(plant); // Handle plant submission
        }
    });
});

// Function to handle plant submission (online and offline)
async function handlePlantSubmission(plant) {
    // Check if online
    if (navigator.onLine) {
        try {
            // Send a POST request to save plant details to the server
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(plant)
            });

            // If response is ok, show success message and redirect
            if (response.ok) {
                alert('Plant details saved to the server.');
                window.location.href = '/'; // Redirect after saving
            } else {
                throw new Error('Failed to save plant details to the server.');
            }
        } catch (error) {
            console.error('Error saving plant details:', error);
            alert('Error saving plant details to the server.');
        }
    } else { // If offline
        try {
            await addItem(plant); // Store the plant object in IndexedDB
            alert('Plant details saved locally.');
            window.location.href = '/'; // Redirect after saving
        } catch (error) {
            console.error('Error saving plant details:', error);
            alert('Error saving plant details locally.');
        }
    }
}

// Function to add item (plant) to IndexedDB
async function addItem(plant) {
    // Open IndexedDB database
    const db = await openDB('PlantFindrDB', 1, {
        // Upgrade database if needed
        upgrade(db) {
            if (!db.objectStoreNames.contains('plants')) {
                db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
            }
        }
    });

    // Start transaction and add the plant to the 'plants' object store
    const tx = db.transaction('plants', 'readwrite');
    await tx.objectStore('plants').add(plant);
    await tx.done;
}

// Function to open IndexedDB database
async function openDB(name, version, { upgrade }) {
    return idb.openDB(name, version, { upgrade });
}
