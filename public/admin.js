// Fetch the list of clients and display them
document.addEventListener('DOMContentLoaded', function () {
    fetchClients();

    // Function to fetch all clients from the server
    function fetchClients() {
        fetch('/api/clients') // This calls the API to get all clients
            .then(response => response.json())
            .then(clients => {
                const clientTableBody = document.querySelector('#clientTable tbody');
                clientTableBody.innerHTML = ''; // Clear the table

                clients.forEach(client => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${client.firstName}</td>
                        <td>${client.lastName}</td>
                        <td>${client.phone}</td>
                        <td>${client.discountCode}</td> <!-- Display the discount code here -->
                        <td>
                            <button class="edit-btn" data-id="${client.id}">Edit</button>
                            <button class="delete-btn" data-id="${client.id}">Delete</button>
                        </td>
                    `;
                    clientTableBody.appendChild(row);
                });

                // Add event listeners to the buttons
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', handleEdit);
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', handleDelete);
                });
            })
            .catch(error => console.error('Error fetching clients:', error));
    }

    // Handle the edit button click
    function handleEdit(event) {
        const clientId = event.target.getAttribute('data-id');
        const row = event.target.parentElement.parentElement;
        const firstName = row.querySelector('td:nth-child(1)').textContent;
        const lastName = row.querySelector('td:nth-child(2)').textContent;
        const phone = row.querySelector('td:nth-child(3)').textContent;

        // Prompt the admin for new information
        const newFirstName = prompt('Edit First Name:', firstName);
        const newLastName = prompt('Edit Last Name:', lastName);
        const newPhone = prompt('Edit Phone Number:', phone);

        if (newFirstName && newLastName && newPhone) {
            // Send the updated information to the server
            fetch('/api/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: clientId,
                    firstName: newFirstName,
                    lastName: newLastName,
                    phone: newPhone
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchClients(); // Refresh the client list
                })
                .catch(error => console.error('Error editing client:', error));
        }
    }

    // Handle the delete button click
    function handleDelete(event) {
        const clientId = event.target.getAttribute('data-id');

        if (confirm('Are you sure you want to delete this client?')) {
            // Send delete request to the server
            fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: clientId })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchClients(); // Refresh the client list
                })
                .catch(error => console.error('Error deleting client:', error));
        }
    }
});
