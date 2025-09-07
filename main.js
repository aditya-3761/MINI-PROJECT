// ===== Menu Toggle =====
const menu = document.querySelector('.menu-icon');
if (menu) {
    menu.onclick = () => {
        menu.classList.toggle("move");
    };
}

// ===== Newsletter Form Submission =====
const newsletterForm = document.getElementById('newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.querySelector('.email');
        const email = emailInput.value.trim();

        if (!email) {
            alert('Please enter your email address.');
            return;
        }

        // Basic email validation using regex
        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert('Thanks for subscribing!');
                emailInput.value = '';
            } else if (response.status === 409) {
                alert('You are already subscribed.');
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not reach server. Please try again later.');
        }
    });
}

// ===== Email Validation Function =====
function validateEmail(email) {
    // Basic pattern: user@domain.com
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
