(async () => {
    document.addEventListener('keydown', function (event) {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isAPressed = event.key === 'a' || event.key === 'A';
        if (isCtrlPressed && isAPressed) {
            event.preventDefault();
            window.location.href = '../admin/view_admin-dashboard.html';
        }
    });

    const API_BASE = '/api';
    const DEFAULT_WA_NUMBER = '6289692783848'; 

    function cleanWaNumber(num) {
        let cleaned = (num || '').replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
        else if (!cleaned.startsWith('62') && cleaned.length > 8) cleaned = '62' + cleaned;
        return cleaned;
    }

    function getEmbedGmapsLink(url) {
        if (!url) return '';
        if (url.includes('googleusercontent.com')) return url;
        if (url.includes('/maps/')) {
            return url
                .replace('/maps/place/', '/maps/embed/place/')
                .replace('/maps/', '/maps/embed/');
        }
        return url;
    }

    async function loadInformasiToko() {
        const alamatEl = document.getElementById('alamat-lengkap');
        const jamBukaEl = document.getElementById('jam-buka-text');
        const jamTutupEl = document.getElementById('jam-tutup-text');
        const waTextEl = document.getElementById('whatsapp-link-text');
        const waBtnEl = document.getElementById('whatsapp-link-button');
        const waMarqueeEl = document.getElementById('whatsapp-link-marquee');
        const gmapsIframe = document.getElementById('gmaps-iframe');

        try {
            const res = await fetch(`${API_BASE}/informasi-toko`);
            const j = await res.json();

            if (j.success && j.data) {
                const d = j.data;

                if (alamatEl) alamatEl.innerText = d.alamat_lengkap || '';

                if (jamBukaEl) jamBukaEl.innerText = d.jam_buka || '';
                if (jamTutupEl) jamTutupEl.innerText = d.jam_tutup || '';

                const heroJamBuka = document.getElementById('hero-jam-buka');
                const heroJamTutup = document.getElementById('hero-jam-tutup');

                if (heroJamBuka) heroJamBuka.innerText = `Buka: ${d.jam_buka || '-'}`;
                if (heroJamTutup) heroJamTutup.innerText = `Tutup: ${d.jam_tutup || '-'}`;

                const waFix = cleanWaNumber(d.nomor_whatsapp || DEFAULT_WA_NUMBER);
                const waUrl = `https://wa.me/${waFix}`;

                if (waTextEl) {
                    waTextEl.href = waUrl;
                    waTextEl.innerText = d.nomor_whatsapp || DEFAULT_WA_NUMBER;
                }

                if (waBtnEl) {
                    waBtnEl.href = waUrl;
                }

                if (waMarqueeEl) {
                    waMarqueeEl.href = waUrl;
                }

                if (gmapsIframe) {
                    gmapsIframe.src = getEmbedGmapsLink(d.lokasi_gmaps_link);
                }

                return waFix;
            }
        } catch (e) {
            console.error("Gagal memuat informasi toko:", e);
        }

        return DEFAULT_WA_NUMBER;
    }

    function setupContactForm(adminNumber) {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearBtn');
        const btnSpinner = document.getElementById('btnSpinner');

        function validateForm() {
            return (
                nameInput.value.trim() !== '' &&
                messageInput.value.trim() !== '' &&
                phoneInput.value.replace(/\D/g, '').length >= 9
            );
        }

        function updateButtonState() {
            if (sendBtn) sendBtn.disabled = !validateForm();
        }

        [nameInput, phoneInput, messageInput, emailInput].forEach(el => {
            el?.addEventListener('input', updateButtonState);
        });

        clearBtn?.addEventListener('click', () => {
            form.reset();
            updateButtonState();
        });

        sendBtn?.addEventListener('click', () => {
            if (!validateForm()) return;

            btnSpinner?.classList.remove('hidden');

            const body =
                `Halo Bubur Ayam Bang Jaka 👋%0A` +
                `Nama: ${encodeURIComponent(nameInput.value)}%0A` +
                `No HP: ${encodeURIComponent(phoneInput.value)}%0A` +
                (emailInput.value
                    ? `Email: ${encodeURIComponent(emailInput.value)}%0A`
                    : '') +
                `%0APesan:%0A${encodeURIComponent(messageInput.value)}`;

            setTimeout(() => {
                btnSpinner?.classList.add('hidden');
                window.open(`https://wa.me/${adminNumber}?text=${body}`, '_blank');
                form.reset();
                updateButtonState();
            }, 500);
        });

        updateButtonState();
    }

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const adminNumber = await loadInformasiToko();
    setupContactForm(adminNumber);
})();
