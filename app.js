const socket = io();

document.getElementById('sign-up-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('sign-up-name').value;
    const mobile = document.getElementById('sign-up-mobile').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;
    const role = document.getElementById('role').value;
    
    let additionalInfo = {};
    if (role === 'student') {
        additionalInfo = {
            classOrDegree: prompt('Enter your studying class or degree:'),
            institution: prompt('Enter your institution name:'),
            city: prompt('Enter your city:')
        };
    } else if (role === 'volunteer') {
        additionalInfo = {
            city: prompt('Enter your city:'),
            occupation: prompt('Enter your occupation:')
        };
    }
    
    const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, password, role, ...additionalInfo })
    });
    const result = await response.json();
    if (result.success) {
        alert('Sign-Up Successful!');
        document.getElementById('sign-in').style.display = 'block';
        document.getElementById('sign-up').style.display = 'none';
    } else {
        alert(result.message);
    }
});

document.getElementById('sign-in-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('sign-in-email').value;
    const password = document.getElementById('sign-in-password').value;
    
    const response = await fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.success) {
        document.getElementById('profile-details').innerHTML = `
            <p>Name: ${result.user.name}</p>
            <p>Email: ${result.user.email}</p>
            <p>Mobile No: ${result.user.mobile}</p>
            <p>City: ${result.user.city || 'N/A'}</p>
            ${result.user.role === 'student' ? `
                <p>Class/Degree: ${result.user.classOrDegree}</p>
                <p>Institution: ${result.user.institution}</p>` : ''}
            ${result.user.role === 'volunteer' ? `<p>Occupation: ${result.user.occupation}</p>` : ''}
        `;
        document.getElementById('profile').style.display = 'block';
        document.getElementById('sign-in').style.display = 'none';
        document.getElementById('sign-up').style.display = 'none';
        document.getElementById('messages').style.display = 'block';
    } else {
        alert(result.message);
    }
});

document.getElementById('send-message').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        socket.emit('sendMessage', messageText);
        messageInput.value = '';
    } else {
        alert('Please enter a message');
    }
});

socket.on('receiveMessage', function(message) {
    const messageList = document.getElementById('message-list');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageList.appendChild(messageDiv);
});
