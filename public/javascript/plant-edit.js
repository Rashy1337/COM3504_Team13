document.addEventListener("DOMContentLoaded", (event) => {
    const editButton = document.getElementById("editNameButton");

    if (editButton) {
        editButton.addEventListener("click", () => {
            const currentName = document.getElementById("plantName").innerText;
            const newName = prompt("Enter new plant name:", currentName);

            if (newName && newName !== currentName) {
                const plantID = document.getElementById("plantID").value;

                fetch(`/plant/updateName/${plantID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ newName })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        window.location.href = `/plant/${encodeURIComponent(newName)}`;
                    } else {
                        alert("Error updating plant name");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Error updating plant name");
                });
            }
        });
    }
});
