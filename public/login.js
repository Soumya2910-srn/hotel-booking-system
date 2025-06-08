document.addEventListener("DOMContentLoaded", function () {
    // Select tab elements and forms
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Select buttons and fields
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
    const userType = document.getElementById('user-type').value;

    // Function to switch to Login form
    function switchToLogin() {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    }

    // Function to switch to Signup form
    function switchToSignup() {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    // Click event for tab switching
    loginTab.addEventListener('click', switchToLogin);
    signupTab.addEventListener('click', switchToSignup);

    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        switchToSignup();
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('login-userid').value;
        const password = document.getElementById('login-password').value;
        const userType = document.getElementById('user-type').value;

        if (!userId || !password) {
            alert('Please enter both ID and password.');
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, userType })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                window.location.href = userType === 'Admin' ? 'admin_dashboard.html' : 'user_dashboard.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Server error. Please try again later.');
        }
    });

    signupButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const userId = document.getElementById('signup-userid').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const userType = 'User'; 

        if (!name || !userId || !password || !confirmPassword) {
            alert('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password, name, userType })
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                switchToLogin(); // Switch to login after successful signup
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Server error. Please try again later.');
        }
    });

    // Ensure default view is Login Form
    switchToLogin();
});
