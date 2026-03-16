const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const carFromUrl = params.get('car');
    if (carFromUrl) {
        const select = document.getElementById('car-model');
        if (select) {
            for (let opt of select.options) {
                if (opt.value === carFromUrl || opt.value.startsWith(carFromUrl)) {
                    opt.selected = true;
                    break;
                }
            }
            select.dispatchEvent(new Event('change'));
            select.style.borderColor = 'var(--primary)';
            select.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.15)';
            setTimeout(() => {
                select.style.borderColor = '';
                select.style.boxShadow = '';
            }, 2000);
        }
    }

    const user = JSON.parse(localStorage.getItem('rento_user') || 'null');
    if (user) {
        const nameInput  = document.getElementById('name');
        const emailInput = document.getElementById('email');
        if (nameInput  && !nameInput.value)  nameInput.value  = user.fullname || '';
        if (emailInput && !emailInput.value) emailInput.value = user.email    || '';
    }
});

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const carModel   = document.getElementById('car-model').value;
        const pickupDate = document.getElementById('pickup-date').value;
        const returnDate = document.getElementById('return-date').value;
        const location   = document.getElementById('pickup-location') ? document.getElementById('pickup-location').value.trim() : '';
        const name       = document.getElementById('name').value.trim();
        const phone      = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
        const email      = document.getElementById('email').value.trim();

        let valid = true;
        valid = bVal('group-car',      !!carModel)   && valid;
        valid = bVal('group-pickup',   !!pickupDate) && valid;
        valid = bVal('group-location', !!location)   && valid;
        valid = bVal('group-name',     !!name)       && valid;
        valid = bVal('group-phone',    !!phone)      && valid;
        valid = bVal('group-email',    !!email && email.includes('@')) && valid;

        const retErr = document.getElementById('return-error');
        if (!returnDate) {
            document.getElementById('group-return').classList.add('error');
            if (retErr) retErr.textContent = 'Please select a return date.';
            valid = false;
        } else if (new Date(pickupDate) >= new Date(returnDate)) {
            document.getElementById('group-return').classList.add('error');
            if (retErr) retErr.textContent = 'Return date must be after pickup date.';
            valid = false;
        } else {
            document.getElementById('group-return').classList.remove('error');
        }

        if (!valid) return;

        const btn = document.querySelector('.btn-submit');
        btn.innerHTML = '<i class="bx bx-loader-alt" style="animation:spin 0.8s linear infinite"></i> Confirming…';
        btn.disabled  = true;

        try {
            const token = localStorage.getItem('rento_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res  = await fetch(`${API}/bookings`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ carModel, pickupDate, returnDate, location, name, phone, email }),
            });
            const data = await res.json();

            if (res.ok) {
                const b = data.booking;
                sessionStorage.setItem('rentoBooking', JSON.stringify({
                    bookingId:    b.id,
                    bookingRef:   b.bookingRef,
                    carModel:     b.carModel,
                    pickupDate:   b.pickupDate,
                    returnDate:   b.returnDate,
                    durationDays: b.durationDays,
                    rate:         b.ratePerDay,
                    totalAmount:  b.totalAmount,
                    name,
                    email,
                }));

                const overlay = document.getElementById('successOverlay');
                if (overlay) {
                    overlay.classList.add('show');
                    const refEl = overlay.querySelector('p');
                    if (refEl) refEl.textContent = `Booking confirmed! Reference: ${b.bookingRef}. Redirecting to payment…`;
                }

                setTimeout(() => { window.location.href = 'payment.html'; }, 2200);
            } else {
                alert(data.message || 'Booking failed. Please try again.');
                btn.innerHTML = '<i class="bx bx-calendar-plus"></i> Confirm Booking';
                btn.disabled  = false;
            }
        } catch (err) {
            alert('Connection error — make sure the backend server is running on port 3000.');
            btn.innerHTML = '<i class="bx bx-calendar-plus"></i> Confirm Booking';
            btn.disabled  = false;
        }
    });
}

function bVal(groupId, isValid) {
    const g = document.getElementById(groupId);
    if (!g) return true;
    g.classList.toggle('error', !isValid);
    return isValid;
}

document.querySelectorAll('#booking-form input, #booking-form select').forEach(el => {
    el.addEventListener('input',  () => el.closest('.form-group')?.classList.remove('error'));
    el.addEventListener('change', () => el.closest('.form-group')?.classList.remove('error'));
});
