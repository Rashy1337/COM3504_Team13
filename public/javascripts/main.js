window.onload = function() {
    var username = localStorage.getItem('username');
    if (username) {
        fetch('/check-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username }),
        })
        .then(response => response.json())
        .then(data => {
            if (!data.exists) {
                localStorage.removeItem('username');
                window.location.href = '/set-username';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        window.location.href = '/set-username';
    }
}