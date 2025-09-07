// Menu
let menu = document.querySelector('.menu-icon');
menu.onclick = () => {
    menu.classList.toggle("move");
};
document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.querySelector('.email');
    const email = emailInput.value.trim();

    if (email) {
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
        } else {
            alert('Something went wrong. Please try again.');
        }
    }
});
