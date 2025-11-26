const API_BASE = 'http://localhost:3000/api';

function cleanWaNumber(num) {
    let cleaned = (num || '').replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62') && cleaned.length > 8) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

function getEmbedGmapsLink(url) {
    if (!url) return '';
    if (url.includes('google.com/maps/embed?')) return url;
    if (url.includes('/maps/')) {
        return url
            .replace('/maps/place/', '/maps/embed/place/')
            .replace('/maps/', '/maps/embed/');
    }
    return url;
}

async function loadInformasiToko() {
    const alamatEl = document.getElementById('alamat-lengkap');
    const jamOpEl = document.getElementById('jam-operasional-text');
    const waTextEl = document.getElementById('whatsapp-number-text');
    const gmapsIframe = document.getElementById('gmaps-iframe');
    const gmapsLink = document.getElementById('gmaps-link');
    const waLinkText = document.getElementById('whatsapp-link-text');
    const waLinkButton = document.getElementById('whatsapp-link-button');

    const defaultWaNumber = '6281234567890';

    if (alamatEl) alamatEl.innerText = 'Memuat alamat...';
    if (jamOpEl) jamOpEl.innerText = 'Memuat jam operasional...';
    if (waTextEl) waTextEl.innerText = 'Memuat nomor...';
    if (gmapsIframe) gmapsIframe.src = 'about:blank';

    try {
        const res = await fetch(`${API_BASE}/informasi-toko`);
        if (!res.ok) throw new Error();

        const j = await res.json();

        if (j.success && j.data) {
            const data = j.data;
            const waNumber = cleanWaNumber(data.nomor_whatsapp);
            const waUrl = `https://wa.me/${waNumber}`;

            if (alamatEl) alamatEl.innerText = data.alamat_lengkap || 'Alamat belum diatur.';
            if (jamOpEl) jamOpEl.innerText = data.jam_operasional || 'Informasi jam operasional belum diatur.';

            const finalGmapsLink = data.lokasi_gmaps_link || '';
            const embedSrc = getEmbedGmapsLink(finalGmapsLink);

            if (gmapsIframe) gmapsIframe.src = embedSrc || 'about:blank';
            if (gmapsLink) gmapsLink.href = finalGmapsLink || '#';

            if (waTextEl) waTextEl.innerText = data.nomor_whatsapp || 'Nomor WA belum diatur.';
            if (waLinkText) waLinkText.href = waUrl;
            if (waLinkButton) waLinkButton.href = waUrl;

            return waNumber;
        } else {
            if (alamatEl) alamatEl.innerText = 'Gagal memuat alamat toko.';
            if (jamOpEl) jamOpEl.innerText = 'Gagal memuat jam operasional.';
            if (waTextEl) waTextEl.innerText = 'Gagal memuat nomor WhatsApp.';
            return defaultWaNumber;
        }
    } catch (error) {
        if (alamatEl) alamatEl.innerText = 'Gagal memuat data. Cek server API Anda.';
        if (jamOpEl) jamOpEl.innerText = 'Gagal memuat data. Cek server API Anda.';
        if (waTextEl) waTextEl.innerText = 'Gagal memuat data. Cek server API Anda.';
        return defaultWaNumber;
    }
}

function setupContactForm(adminNumber) {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const sendBtn = document.getElementById('send-wa');
    const clearBtn = document.getElementById('clear-btn');
    const btnSpinner = sendBtn ? (sendBtn.querySelector('.submit-spinner') || sendBtn.querySelector('#submit-spinner') || document.getElementById('submit-spinner')) : document.getElementById('submit-spinner');
    const formMsg = document.getElementById('form-msg');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    if (!nameInput || !phoneInput || !messageInput || !sendBtn) return;

    function showToast(text, timeout = 2500) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = text;
        t.classList.remove('hidden');
        clearTimeout(t._hideTimeout);
        t._hideTimeout = setTimeout(() => t.classList.add('hidden'), timeout);
    }

    function validateForm() {
        formMsg.textContent = '';
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();
        if (!name || !phone || !message) return false;
        const digits = phone.replace(/[^0-9]/g, '');
        if (digits.length < 9) {
            formMsg.textContent = 'Mohon masukkan nomor telepon yang valid.';
            return false;
        }
        return true;
    }

    function setSubmitState(enabled) {
        sendBtn.disabled = !enabled;
        sendBtn.setAttribute('aria-disabled', String(!enabled));
        if (enabled) {
            sendBtn.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
            sendBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'text-white');
        } else {
            sendBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'text-white');
            sendBtn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        }
    }

    function updateButtonState() {
        setSubmitState(validateForm());
    }

    [nameInput, phoneInput, messageInput, emailInput].forEach(el => {
        if (!el) return;
        el.addEventListener('input', () => {
            formMsg.textContent = '';
            updateButtonState();
        });
    });

    clearBtn?.addEventListener('click', () => {
        form.reset();
        updateButtonState();
        showToast('Form dibersihkan');
    });

    sendBtn?.addEventListener('click', () => {
        if (!validateForm()) {
            showToast('Silakan lengkapi formulir dengan benar');
            return;
        }

        if (btnSpinner) btnSpinner.classList.remove('hidden');
        sendBtn.disabled = true;

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        let body = `Halo Bubur Ayam Bang Jaka 👋%0A`;
        body += `Nama: ${encodeURIComponent(name)}%0A`;
        body += `No HP: ${encodeURIComponent(phone)}%0A`;
        if (email) body += `Email: ${encodeURIComponent(email)}%0A`;
        body += `%0APesan:%0A${encodeURIComponent(message)}%0A`;
        body += `%0A(Kirim dari halaman kontak)`;

        const url = `https://wa.me/${adminNumber}?text=${body}`;

        setTimeout(() => {
            if (btnSpinner) btnSpinner.classList.add('hidden');
            sendBtn.disabled = false;
            showToast('Membuka WhatsApp...');
            window.open(url, '_blank');
            form.reset();
            updateButtonState();
        }, 600);
    });

    updateButtonState();
}

document.addEventListener('DOMContentLoaded', async () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const adminNumber = await loadInformasiToko();
    setupContactForm(adminNumber);
});
