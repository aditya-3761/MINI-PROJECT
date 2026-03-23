const API = 'https://rento-zstk.onrender.com/api';

const saveAuth = (token, user) => {
    localStorage.setItem('rento_token', token);
    localStorage.setItem('rento_user', JSON.stringify(user));
};

const getToken = () => localStorage.getItem('rento_token');
const getUser  = () => JSON.parse(localStorage.getItem('rento_user') || 'null');

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        let valid = true;
        const emailGroup = document.getElementById('group-email');
        const passGroup  = document.getElementById('group-password');

        if (!email || !email.includes('@')) {
            emailGroup.classList.add('error'); valid = false;
        } else { emailGroup.classList.remove('error'); }

        if (!password) {
            passGroup.classList.add('error'); valid = false;
        } else { passGroup.classList.remove('error'); }

        if (!valid) return;

        const btn = document.getElementById('loginBtn');
        btn.innerHTML = '<i class="bx bx-loader-alt" style="animation:spin 0.8s linear infinite"></i> Logging in…';
        btn.disabled = true;

        try {
            const res  = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                saveAuth(data.token, data.user);
                btn.innerHTML = '<i class="bx bx-check"></i> Welcome back!';
                btn.style.background = '#16a34a';
                setTimeout(() => {
                    const redirect = sessionStorage.getItem('loginRedirect') || 'index.html';
                    sessionStorage.removeItem('loginRedirect');
                    window.location.href = redirect;
                }, 900);
            } else {
                const errEl = document.querySelector('#group-email .field-error');
                if (errEl) errEl.textContent = data.error || 'Invalid email or password';
                emailGroup.classList.add('error');
                btn.innerHTML = '<i class="bx bx-log-in"></i> Log In';
                btn.disabled = false;
                btn.style.background = '';
            }
        } catch (err) {
            alert('Connection error — make sure the backend server is running on port 3000.');
            btn.innerHTML = '<i class="bx bx-log-in"></i> Log In';
            btn.disabled = false;
        }
    });
}

const signupForm = document.querySelector('.signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname     = document.getElementById('fullname').value.trim();
        const email        = document.getElementById('email').value.trim();
        const password     = document.getElementById('password').value;
        const confpassword = document.getElementById('confpassword').value;
        const phone        = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const terms        = document.getElementById('terms').checked;

        let valid = true;

        function setFErr(id, show) {
            const g = document.getElementById(id);
            if (g) g.classList.toggle('error', show);
        }

        setFErr('group-fullname', !fullname);        if (!fullname) valid = false;
        setFErr('group-email', !email || !email.includes('@')); if (!email || !email.includes('@')) valid = false;
        setFErr('group-password', password.length < 6); if (password.length < 6) valid = false;

        const confErr = document.getElementById('conf-error');
        if (!confpassword || password !== confpassword) {
            document.getElementById('group-confpassword').classList.add('error');
            if (confErr) confErr.textContent = !confpassword ? 'Please confirm your password.' : 'Passwords do not match.';
            valid = false;
        } else {
            document.getElementById('group-confpassword').classList.remove('error');
        }

        const termsErr = document.getElementById('terms-error');
        if (!terms) { if (termsErr) termsErr.style.display = 'block'; valid = false; }
        else { if (termsErr) termsErr.style.display = 'none'; }

        if (!valid) return;

        const btn = document.getElementById('signupBtn');
        btn.innerHTML = '<i class="bx bx-loader-alt" style="animation:spin 0.8s linear infinite"></i> Creating account…';
        btn.disabled = true;

        try {
            const res  = await fetch(`${API}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname, email, password, phone }),
            });
            const data = await res.json();

            if (res.ok) {
                saveAuth(data.token, data.user);
                btn.innerHTML = '<i class="bx bx-check"></i> Account Created!';
                btn.style.background = '#16a34a';
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } else {
                alert(data.error || 'Sign up failed. Please try again.');
                btn.innerHTML = '<i class="bx bx-user-plus"></i> Create Account';
                btn.disabled = false;
                btn.style.background = '';
            }
        } catch (err) {
            alert('Connection error — make sure the backend server is running on port 3000.');
            btn.innerHTML = '<i class="bx bx-user-plus"></i> Create Account';
            btn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const userIcon = document.querySelector('.nav-icons a[href="loginpage.html"]');
    if (user && userIcon) {
        userIcon.innerHTML = '<i class="bx bx-user-check" style="color:var(--primary)"></i>';
        userIcon.href = '#';
        userIcon.title = `Logged in as ${user.fullname}`;
    }
});
