document.addEventListener('DOMContentLoaded', () => {
    updateNavUserState();
    highlightActiveLink();
});

function updateNavUserState() {
    const user     = JSON.parse(localStorage.getItem('rento_user') || 'null');
    const userLink = document.querySelector('.nav-icons a[href="loginpage.html"]');
    if (!userLink) return;

    if (user) {
        const initials = user.fullname
            ? user.fullname.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            : 'U';

        userLink.outerHTML = `
            <div class="nav-user-wrap" style="position:relative;">
                <button class="nav-user-btn" id="navUserBtn"
                    style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;border:none;cursor:pointer;font-family:var(--font-display);font-size:13px;font-weight:800;letter-spacing:-0.5px;display:flex;align-items:center;justify-content:center;transition:transform 0.2s;"
                    title="${user.fullname}">${initials}</button>
                <div id="navDropdown"
                    style="display:none;position:absolute;top:48px;right:0;background:var(--white,#fff);border:1.5px solid var(--border,rgba(0,0,0,0.08));border-radius:14px;padding:8px;min-width:180px;box-shadow:0 12px 40px rgba(0,0,0,0.12);z-index:2000;">
                    <div style="padding:10px 12px;border-bottom:1px solid var(--border,rgba(0,0,0,0.08));margin-bottom:4px;">
                        <div style="font-size:13px;font-weight:700;color:var(--text,#1a1a1a);">${user.fullname}</div>
                        <div style="font-size:11px;color:var(--text-muted,#666);margin-top:2px;">${user.email}</div>
                    </div>
                    <a href="bookings.html"    class="nav-drop-item"><i class='bx bx-calendar'></i> My Bookings</a>
                    <a href="customerpage.html" class="nav-drop-item"><i class='bx bx-support'></i> Support</a>
                    <button onclick="logoutUser()" class="nav-drop-item nav-drop-logout"><i class='bx bx-log-out'></i> Log Out</button>
                </div>
            </div>`;

        const style = document.createElement('style');
        style.textContent = `
            .nav-drop-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:500;color:#555;text-decoration:none;background:none;border:none;cursor:pointer;font-family:inherit;transition:all 0.2s;text-align:left;}
            .nav-drop-item i{font-size:16px;}
            .nav-drop-item:hover{background:rgba(255,107,0,0.08);color:#ff6b00;}
            .nav-drop-logout{color:#e53935;margin-top:4px;border-top:1px solid rgba(0,0,0,0.06);padding-top:10px;}
            .nav-drop-logout:hover{background:rgba(229,57,53,0.08);color:#e53935;}
            #navUserBtn:hover{transform:scale(1.08);}
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            const btn = document.getElementById('navUserBtn');
            const dd  = document.getElementById('navDropdown');
            if (btn && dd) {
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
                });
                document.addEventListener('click', () => { dd.style.display = 'none'; });
            }
        }, 100);
    }
}

window.logoutUser = () => {
    localStorage.removeItem('rento_token');
    localStorage.removeItem('rento_user');
    sessionStorage.removeItem('rentoBooking');
    window.location.href = 'index.html';
};

function highlightActiveLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = (link.getAttribute('href') || '').split('/').pop().split('#')[0];
        if (href && href === current) link.classList.add('active');
    });
}
