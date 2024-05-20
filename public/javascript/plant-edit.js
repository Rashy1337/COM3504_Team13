// When the DOM content is loaded, execute this function
document.addEventListener("DOMContentLoaded", (event) => {
    // Get the editNameButton element from the DOM
    const editButton = document.getElementById("editNameButton");

    // If the edit button exists
    if (editButton) {
        // Add an event listener to the edit button
        editButton.addEventListener("click", () => {
            // Get the current plant name from the DOM
            const currentName = document.getElementById("plantName").innerText;
            // Prompt the user to enter a new plant name, defaulting to the current name
            const newName = prompt("Enter new plant name:", currentName);

            // If the user entered a new name and it's different from the current name
            if (newName && newName !== currentName) {
                // Get the plant ID from the DOM
                const plantID = document.getElementById("plantID").value;

                // Send a POST request to update the plant name
                fetch(`/plant/updateName/${plantID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ newName })
                })
                    // Handle the response
                    .then(response => {
                        // If response is not ok, throw an error
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        // Parse response as JSON
                        return response.json();
                    })
                    // Handle the JSON data
                    .then(data => {
                        // If update was successful, redirect to the new plant page
                        if (data.success) {
                            window.location.href = `/plant/${encodeURIComponent(newName)}`;
                        } else {
                            // If update was not successful, show an error message
                            alert("Error updating plant name");
                        }
                    })
                    // Catch any errors
                    .catch(error => {
                        console.error("Error:", error);
                        alert("Error updating plant name");
                    });
            }
        });
    }
});
