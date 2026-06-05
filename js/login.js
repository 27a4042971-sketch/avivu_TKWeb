/**
 * avivu — login.js
 * Sliding Login / Register
 * Flow:
 * - Đăng ký lưu avivu_users
 * - Đăng nhập lưu currentUser
 * - Nếu URL có ?redirect=... thì đăng nhập xong quay về đúng trang đó
 */

document.addEventListener('DOMContentLoaded', () => {
    initDefaultMode();
    initSwitchButtons();
    initRedirectNotice();
    initPasswordToggle();
    initSocialDemo();
    initLoginForm();
    initRegisterForm();
    initForgotPassword();
    initOtpInputs();
    initRememberedEmail();
});

/* =========================
   BASE HELPERS
========================= */

function getAuthShell() {
    return document.getElementById('authShell');
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem('avivu_users') || '[]');
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('avivu_users', JSON.stringify(users));
}

function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || '../index.html';
}

function showAlert(title, text, icon = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title,
            text,
            icon,
            confirmButtonColor: '#ff6b35'
        });
        return;
    }

    alert(`${title}\n${text}`);
}

function showToast(title, icon = 'success') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            title,
            icon,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
        });
        return;
    }

    alert(title);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function getLastName(name) {
    return String(name || 'bạn').trim().split(/\s+/).slice(-1)[0];
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

/* =========================
   SLIDING MODE
========================= */

function setAuthMode(mode) {
    const shell = getAuthShell();
    if (!shell) return;

    shell.classList.remove('register-mode', 'forgot-mode');

    if (mode === 'register') {
        shell.classList.add('register-mode');
    }

    if (mode === 'forgot') {
        shell.classList.add('forgot-mode');
    }
}

function initDefaultMode() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('tab') === 'register') {
        setAuthMode('register');
    } else {
        setAuthMode('login');
    }
}

function initSwitchButtons() {
    document.querySelectorAll('[data-switch]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.switch || 'login';
            resetForgotForm();
            setAuthMode(target);
        });
    });
}

function initRedirectNotice() {
    const params = new URLSearchParams(window.location.search);
    const notice = document.getElementById('redirectNotice');

    if (!notice) return;

    if (params.get('redirect')) {
        notice.style.display = 'flex';
    }
}

/* =========================
   PASSWORD / SOCIAL
========================= */

function initPasswordToggle() {
    document.querySelectorAll('.toggle-pass').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (!input || !icon) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

function initSocialDemo() {
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.dataset.provider || 'mạng xã hội';

            showAlert(
                `Đăng nhập với ${provider}`,
                `Tính năng ${provider} đang được mô phỏng. Hiện tại bạn hãy dùng email và mật khẩu.`,
                'info'
            );
        });
    });
}

/* =========================
   LOGIN
========================= */

function initLoginForm() {
    const form = document.getElementById('loginForm');

    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPass').value;

        if (!email || !password) {
            showAlert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.', 'warning');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.', 'error');
            return;
        }

        const users = getUsers();
        const user = users.find(item => item.email === email);

        if (!user) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Tài khoản chưa tồn tại',
                    text: 'Email này chưa được đăng ký. Bạn có muốn tạo tài khoản mới không?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Đăng ký ngay',
                    cancelButtonText: 'Thử lại',
                    confirmButtonColor: '#ff6b35'
                }).then(result => {
                    if (result.isConfirmed) {
                        setAuthMode('register');

                        const regEmail = document.getElementById('regEmail');
                        if (regEmail) regEmail.value = email;
                    }
                });
            } else {
                alert('Tài khoản chưa tồn tại.');
            }

            return;
        }

        const hashedPassword = await hashPassword(password);

        if (user.password !== hashedPassword) {
            showAlert('Sai mật khẩu', 'Mật khẩu không chính xác. Hãy thử lại hoặc dùng chức năng quên mật khẩu.', 'error');
            return;
        }

        const currentUser = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            points: user.points || 0
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        const rememberMe = document.getElementById('rememberMe')?.checked;

        if (rememberMe) {
            localStorage.setItem('avivu_remember_email', email);
        } else {
            localStorage.removeItem('avivu_remember_email');
        }

        const redirect = getRedirectUrl();

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: `Xin chào, ${getLastName(user.name)}!`,
                text: 'Đăng nhập thành công. avivu sẽ đưa bạn đến trang tiếp theo.',
                icon: 'success',
                confirmButtonColor: '#ff6b35',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                window.location.href = redirect;
            });
        } else {
            window.location.href = redirect;
        }
    });
}

function initRememberedEmail() {
    const rememberedEmail = localStorage.getItem('avivu_remember_email');

    if (!rememberedEmail) return;

    const emailInput = document.getElementById('loginEmail');
    const rememberInput = document.getElementById('rememberMe');

    if (emailInput) emailInput.value = rememberedEmail;
    if (rememberInput) rememberInput.checked = true;
}

/* =========================
   REGISTER
========================= */

function initRegisterForm() {
    const form = document.getElementById('registerForm');

    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPass').value;

        if (!name || !email || !phone || !password) {
            showAlert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin đăng ký.', 'warning');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.', 'error');
            return;
        }

        if (!isValidPhone(phone)) {
            showAlert('Số điện thoại không hợp lệ', 'Số điện thoại phải gồm đúng 10 chữ số.', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Mật khẩu quá ngắn', 'Mật khẩu cần có tối thiểu 6 ký tự.', 'error');
            return;
        }

        const users = getUsers();

        if (users.some(user => user.email === email)) {
            showAlert('Email đã tồn tại', 'Email này đã được đăng ký. Vui lòng đăng nhập.', 'error');
            return;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = {
            name,
            email,
            phone,
            password: hashedPassword,
            joinDate: new Date().toISOString(),
            points: 0,
            favorites: [],
            bookings: []
        };

        users.push(newUser);
        saveUsers(users);

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Đăng ký thành công!',
                html: `Chào mừng <strong>${escapeHtml(name)}</strong> đến với avivu.<br>Bạn có thể đăng nhập để tiếp tục.`,
                icon: 'success',
                confirmButtonColor: '#ff6b35',
                confirmButtonText: 'Đăng nhập ngay'
            }).then(() => {
                form.reset();
                setAuthMode('login');

                const loginEmail = document.getElementById('loginEmail');
                if (loginEmail) loginEmail.value = email;
            });
        } else {
            form.reset();
            setAuthMode('login');
        }
    });
}

/* =========================
   FORGOT PASSWORD
========================= */

function initForgotPassword() {
    const showForgotBtn = document.getElementById('showForgotBtn');
    const backLoginBtn = document.getElementById('backLoginBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const confirmOtpBtn = document.getElementById('confirmOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');

    showForgotBtn?.addEventListener('click', () => {
        setAuthMode('forgot');
    });

    backLoginBtn?.addEventListener('click', () => {
        resetForgotForm();
        setAuthMode('login');
    });

    sendOtpBtn?.addEventListener('click', () => {
        const identifier = document.getElementById('forgotIdentifier').value.trim();

        if (!identifier) {
            showAlert('Thiếu thông tin', 'Vui lòng nhập email hoặc số điện thoại.', 'warning');
            return;
        }

        document.getElementById('forgotStep1').style.display = 'none';
        document.getElementById('forgotStep2').style.display = 'block';

        showToast('Đã gửi mã OTP demo');
    });

    resendOtpBtn?.addEventListener('click', () => {
        showToast('Đã gửi lại OTP demo', 'info');
    });

    confirmOtpBtn?.addEventListener('click', async () => {
        const otp = Array.from(document.querySelectorAll('.otp-input'))
            .map(input => input.value)
            .join('');

        const newPassword = document.getElementById('newPassword').value;
        const identifier = document.getElementById('forgotIdentifier').value.trim();

        if (otp.length < 6) {
            showAlert('OTP chưa đủ', 'Vui lòng nhập đủ 6 chữ số OTP.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showAlert('Mật khẩu quá ngắn', 'Mật khẩu mới cần tối thiểu 6 ký tự.', 'error');
            return;
        }

        const users = getUsers();
        const userIndex = users.findIndex(user => user.email === identifier || user.phone === identifier);

        if (userIndex === -1) {
            showAlert('Không tìm thấy tài khoản', 'Email hoặc số điện thoại này chưa được đăng ký.', 'error');
            return;
        }

        users[userIndex].password = await hashPassword(newPassword);
        saveUsers(users);

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Đặt lại mật khẩu thành công',
                text: 'Bạn có thể đăng nhập bằng mật khẩu mới.',
                icon: 'success',
                confirmButtonColor: '#ff6b35'
            }).then(() => {
                resetForgotForm();
                setAuthMode('login');
            });
        } else {
            resetForgotForm();
            setAuthMode('login');
        }
    });
}

function resetForgotForm() {
    const forgotIdentifier = document.getElementById('forgotIdentifier');
    const newPassword = document.getElementById('newPassword');
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');

    if (forgotIdentifier) forgotIdentifier.value = '';
    if (newPassword) newPassword.value = '';

    document.querySelectorAll('.otp-input').forEach(input => {
        input.value = '';
    });

    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
}

function initOtpInputs() {
    const inputs = Array.from(document.querySelectorAll('.otp-input'));

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').slice(0, 1);

            if (input.value && inputs[index + 1]) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', event => {
            if (event.key === 'Backspace' && !input.value && inputs[index - 1]) {
                inputs[index - 1].focus();
            }
        });
    });
}