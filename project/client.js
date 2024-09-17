// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Listen for form submission
    const form = document.querySelector('form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the default way

        // Capture the input values from the form
        const firstName = document.querySelector('#firstName').value;
        const lastName = document.querySelector('#lastName').value;
        const phone = document.querySelector('#phone').value;

        // Generate a random discount code for the user
        const discountCode = generateDiscountCode();

        // Prepare the data to send to the server
        const formData = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            discountCode: discountCode
        };

        // Send the form data to the server using Fetch API
        fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                // Check if the user already has a discount code
                if (data.message === 'You have already received a discount code.') {
                    showMessage('You already have a discount code.');
                } else {
                    // Display the success message and the discount code
                    showMessage(`${data.message} Your code: ${data.code}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('An error occurred while submitting the form. Please try again.');
            });
    });

    // Function to generate a random discount code (example logic)
    function generateDiscountCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    // Function to display a message to the user
    function showMessage(message) {
        const messageBox = document.querySelector('#messageBox');
        messageBox.textContent = message;
        messageBox.style.display = 'block';
    }
});
