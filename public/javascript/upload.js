document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('plantForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const form = event.target;

        const plantName = form.plantName.value;
        const dateTime = form.dateTime.value;
        const plantSize = form.plantSize.value;
        const plantCharacteristics = form.plantCharacteristics.value;
        const location = form.location.value;
        const url = form.url.value;
        const address = form.address.value;
        const username = form.username.value;

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
                    location,
                    url,
                    address,
                    username,
                    plantPhoto
                };
                await handlePlantSubmission(plant, file);
            };
            reader.readAsDataURL(file);
        } else {
            const plant = {
                plantName,
                dateTime,
                plantSize,
                plantCharacteristics,
                location,
                url,
                address,
                username,
                plantPhoto
            };
            await handlePlantSubmission(plant);
        }
    });
});

async function handlePlantSubmission(plant, file = null) {
    if (navigator.onLine) {
        try {
            const formData = new FormData();
            formData.append('plantName', plant.plantName);
            formData.append('dateTime', plant.dateTime);
            formData.append('plantSize', plant.plantSize);
            formData.append('plantCharacteristics', plant.plantCharacteristics);
            formData.append('location', plant.location);
            formData.append('url', plant.url);
            formData.append('address', plant.address);
            formData.append('username', plant.username);
            if (file) {
                formData.append('plantPhoto', file);
            }

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
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
            await addItem(plant);
            alert('Plant details saved locally.');
            window.location.href = '/';  // Redirect after saving
        } catch (error) {
            console.error('Error saving plant details:', error);
            alert('Error saving plant details locally.');
        }
    }
}
