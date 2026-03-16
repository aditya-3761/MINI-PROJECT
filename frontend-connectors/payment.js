const API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
    prefillCardName();
    guardPaymentPage();
});

function loadOrderSummary() {
    try {
        const booking = JSON.parse(sessionStorage.getItem('rentoBooking') || '{}');

        if (booking.carModel) {
            setText('orderCarName', booking.carModel);
            const carImages = {
                'Rolls-Royce':        'rental-1.png',
                'Macan 4':            'rental-2.png',
                'Cayenne S E-Hybrid': 'rental-3.png',
                'Nissan GT-R':        'rental-4.png',
                'Panamera Turbo':     'rental-5.png',
                'Nissan Ariyan':      'rental-6.png',
                'Canyenne Turbo':     'rental-7.png',
                '718 Boxster S':      'rental-8.png',
                'Taycan S':           'trend-1.png',
                'Taycan v':           'trend-2.png',
                'Taycan Turbo':       'trend-3.png',
                'Taycan twin':        'trend-4.png',
            };
            const img = document.getElementById('orderCarImg');
            if (img) img.src = carImages[booking.carModel] || 'rental-1.png';
        }

        if (booking.pickupDate) setText('orderPickup', formatDate(booking.pickupDate));
        if (booking.returnDate) setText('orderReturn',  formatDate(booking.returnDate));

        if (booking.durationDays) {
            setText('orderDays', booking.durationDays + ' day' + (booking.durationDays > 1 ? 's' : ''));
        }
        if (booking.rate) {
            setText('orderRate', '₹' + Number(booking.rate).toLocaleString('en-IN') + '/day');
        }
        if (booking.totalAmount) {
            const total = '₹' + Number(booking.totalAmount).toLocaleString('en-IN');
            setText('orderTotal', total);
            const btn = document.getElementById('payBtn');
            if (btn) btn.innerHTML = `<i class='bx bx-lock-alt'></i> Pay ${total}`;
        }
    } catch (err) {
        console.warn('Could not load booking summary:', err);
    }
}

function prefillCardName() {
    const booking = JSON.parse(sessionStorage.getItem('rentoBooking') || '{}');
    const user    = JSON.parse(localStorage.getItem('rento_user') || 'null');
    const nameInput = document.getElementById('card-name');
    if (nameInput) {
        nameInput.value = (user && user.fullname) ? user.fullname : (booking.name || '');
        nameInput.dispatchEvent(new Event('input'));
    }
}

function guardPaymentPage() {
    const booking = JSON.parse(sessionStorage.getItem('rentoBooking') || '{}');
    if (!booking.carModel) {
        const notice = document.createElement('div');
        notice.style.cssText = 'position:fixed;top:90px;left:50%;transform:translateX(-50%);background:#fff3e0;border:1.5px solid rgba(255,107,0,0.35);border-radius:12px;padding:12px 24px;font-size:14px;color:#c2410c;font-weight:600;z-index:500;box-shadow:0 4px 20px rgba(0,0,0,0.1);';
        notice.innerHTML = '⚠ No active booking found. <a href="bookings.html" style="color:inherit;text-decoration:underline;">Make a booking first</a>';
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 6000);
    }
}

const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name       = document.getElementById('card-name').value.trim();
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiration = document.getElementById('expiration').value;
        const cvv        = document.getElementById('cvv').value.trim();

        let valid = true;
        valid = pVal('group-name',   !!name)                         && valid;
        valid = pVal('group-number', /^\d{13,19}$/.test(cardNumber)) && valid;
        valid = pVal('group-expiry', !!expiration)                   && valid;
        valid = pVal('group-cvv',    /^\d{3,4}$/.test(cvv))          && valid;
        if (!valid) return;

        const [yr, mo] = expiration.split('-').map(Number);
        const now = new Date();
        if (yr < now.getFullYear() || (yr === now.getFullYear() && mo < now.getMonth() + 1)) {
            pVal('group-expiry', false);
            const el = document.querySelector('#group-expiry .field-error');
            if (el) el.textContent = 'Card is expired.';
            return;
        }

        const btn = document.getElementById('payBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bx bx-loader-alt" style="animation:spin 0.8s linear infinite"></i> Processing…';
        btn.disabled  = true;

        try {
            const booking = JSON.parse(sessionStorage.getItem('rentoBooking') || '{}');
            const token   = localStorage.getItem('rento_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res  = await fetch(`${API}/payment`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name, cardNumber, expiration, cvv,
                    bookingId: booking.bookingId || null,
                    method: 'card',
                }),
            });
            const data = await res.json();

            if (res.ok) {
                paymentForm.reset();
                resetCardPreview();
                sessionStorage.removeItem('rentoBooking');
                showSuccess(data.transactionRef, data.bookingRef);
            } else {
                alert(data.error || 'Payment failed. Please try again.');
                btn.innerHTML = originalText;
                btn.disabled  = false;
            }
        } catch (err) {
            console.warn('Backend unreachable, showing demo success.');
            sessionStorage.removeItem('rentoBooking');
            showSuccess('TXN-DEMO-' + Date.now(), null);
            btn.innerHTML = originalText;
            btn.disabled  = false;
        }
    });
}

window.handleQrPaymentSuccess = async (decodedText) => {
    try {
        const booking = JSON.parse(sessionStorage.getItem('rentoBooking') || '{}');
        const token   = localStorage.getItem('rento_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res  = await fetch(`${API}/payment/qr`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                qrData: decodedText,
                bookingId: booking.bookingId || null,
            }),
        });
        const data = await res.json();
        sessionStorage.removeItem('rentoBooking');
        showSuccess(data.transactionRef, data.bookingRef);
    } catch (err) {
        sessionStorage.removeItem('rentoBooking');
        showSuccess('TXN-QR-' + Date.now(), null);
    }
};

function showSuccess(txnRef, bookingRef) {
    const overlay = document.getElementById('successOverlay');
    if (!overlay) return;
    const refEl = document.getElementById('refCode');
    if (refEl) refEl.textContent = bookingRef || ('RNT-' + Math.floor(100000 + Math.random() * 900000));
    const msgEl = overlay.querySelector('.msg');
    if (msgEl && txnRef) {
        msgEl.innerHTML += `<br><small style="color:var(--text-dim);font-size:12px;">Transaction: ${txnRef}</small>`;
    }
    overlay.classList.add('show');
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pVal(groupId, isValid) {
    const g = document.getElementById(groupId);
    if (!g) return true;
    g.classList.toggle('error', !isValid);
    return isValid;
}

function resetCardPreview() {
    setText('previewName',   'YOUR NAME');
    setText('previewNumber', '•••• •••• •••• ••••');
    setText('previewExpiry', 'MM/YY');
}

document.querySelectorAll('#payment-form input').forEach(el => {
    el.addEventListener('input', () => el.closest('.form-group')?.classList.remove('error'));
});
