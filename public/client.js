document.getElementById('client-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // Generate a discount code
    const discountCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Send data to server
    fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, phone, discountCode })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject('Failed to submit: ' + response.statusText);
            }
        })
        .then(data => {
            // Redirect to thank you page with discount code
            window.location.href = `/thank-you.html?code=${data.discountCode}`;
        })
        .catch(error => {
            alert('Error: ' + error);
            console.error('Error:', error);
        });
});
