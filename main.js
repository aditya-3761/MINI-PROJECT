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
                // Safely handle JSON parsing only if content exists and is JSON
                const contentType = response.headers.get('content-type');
                let data = null;

                if (contentType && contentType.includes('application/json')) {
                    const text = await response.text();
                    if (text) {
                        try {
                            data = JSON.parse(text);
                        } catch (err) {
                            console.warn('Could not parse JSON:', err);
                        }
                    }
                }

                // Optionally, do something with `data` here if needed

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
