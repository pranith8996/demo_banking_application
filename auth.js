document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = StorageManager.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Store session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            loginError.textContent = 'Invalid username or password';
            setTimeout(() => {
                loginError.textContent = '';
            }, 3000);
        }
    });
});