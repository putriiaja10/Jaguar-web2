const API_BASE = 'http://localhost:3000/api';

async function loadJamOperasional() {
    try {
        const res = await fetch(`${API_BASE}/informasi-toko`);
        const j = await res.json();
        
        if (j.success && j.data) {
            const jamBukaHero = document.getElementById('jam-buka-hero');
            const jamTutupHero = document.getElementById('jam-tutup-hero');
            
            if (jamBukaHero && j.data.jam_buka) {
                jamBukaHero.innerText = j.data.jam_buka.substring(0, 5);
            }
            if (jamTutupHero && j.data.jam_tutup) {
                jamTutupHero.innerText = j.data.jam_tutup.substring(0, 5);
            }
            
            const jamBukaText = document.getElementById('jam-buka-text');
            const jamTutupText = document.getElementById('jam-tutup-text');
            
            if (jamBukaText && j.data.jam_buka) {
                jamBukaText.innerText = `${j.data.jam_buka.substring(0, 5)} WIB`;
            }
            if (jamTutupText && j.data.jam_tutup) {
                jamTutupText.innerText = `${j.data.jam_tutup.substring(0, 5)} WIB`;
            }

            const alamatTokoEl = document.getElementById('alamat-toko');
            if (alamatTokoEl && j.data.alamat_lengkap) {
                alamatTokoEl.innerText = j.data.alamat_lengkap;
            }

            const gmapsIframe = document.getElementById('gmaps-iframe');
            if (gmapsIframe && j.data.lokasi_gmaps_link) {
                gmapsIframe.src = j.data.lokasi_gmaps_link;
            }
            
            const waNumber = j.data.nomor_whatsapp ? j.data.nomor_whatsapp.replace(/\s/g, '').replace(/[-\(\)]/g, '') : null;
            const waLinkElement = document.querySelector('.hero-btn-order');
            if (waLinkElement && waNumber) {
                waLinkElement.href = `https://wa.me/${waNumber}`; 
            }
            const waOrderSectionLink = document.querySelector('.marquee-list a[aria-label="Order via WhatsApp"]');
            if (waOrderSectionLink && waNumber) {
                waOrderSectionLink.href = `https://wa.me/${waNumber}`;
            }
            const waNumberText = document.getElementById('whatsapp-number-text');
            const waLinkText = document.getElementById('whatsapp-link-text');
            if (waNumberText) waNumberText.innerText = j.data.nomor_whatsapp;
            if (waLinkText) waLinkText.href = `https://wa.me/${waNumber}`;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadMenuPreview() {
    try {
        const res = await fetch(`${API_BASE}/menu/latest`); 
        const result = await res.json();
        const menuContainer = document.getElementById('menu-preview-container'); 
        if (!menuContainer) return;
        
        menuContainer.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Memuat menu...</p>';

        if (result.success && result.data && result.data.length > 0) {
            const menuPreview = result.data.slice(0, 4);
            menuContainer.innerHTML = menuPreview.map(item => {
                const fotoPath = item.foto ? `/images/menu/${item.foto}` : '/images/default/default-menu.png';
                const formattedHarga = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(item.harga || 0);
                const isHabis = item.status_menu === 'Habis'; 
                const opacityClass = isHabis ? 'opacity-60' : '';
                const statusOverlay = isHabis ? `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><span class="text-xl font-bold text-white uppercase">Habis</span></div>` : '';

                return `
                    <article class="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl ${opacityClass}">
                        <div class="relative w-full h-40">
                            <img src="${fotoPath}" alt="${item.menu}" class="w-full h-full object-cover">
                            ${statusOverlay}
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-lg text-[#706442]">${item.menu}</h3>
                            <p class="text-gray-900 font-semibold mt-1">${formattedHarga}</p>
                            <p class="text-sm text-gray-500 line-clamp-2">${item.keterangan_menu || ''}</p>
                        </div>
                    </article>
                `;
            }).join('');
        } else {
            menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">Menu belum tersedia.</p>`;
        }
    } catch (e) {
        console.error(e);
    }
}

function openLightbox(imgElement) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imgElement.getAttribute('data-full-src');
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        lightboxImg.src = '';
    }
}

async function loadGaleriPreview() {
    try {
        const res = await fetch(`${API_BASE}/galeri/latest`); 
        const j = await res.json();
        const galeriContainer = document.getElementById('galeri-preview-container'); 
        if (!galeriContainer) return;
        
        if (j.success && j.data && j.data.length > 0) {
            galeriContainer.innerHTML = ''; 
            const galeriPreview = j.data.slice(0, 4); 
            galeriPreview.forEach(photo => {
                const imagePath = `/${photo.path_file}`; 
                const articleHtml = `
                    <article class="relative overflow-hidden group rounded-lg shadow-lg cursor-pointer aspect-[4/3]">
                        <img loading="lazy" src="${imagePath}" alt="${photo.nama_foto}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105 gallery-item" data-full-src="${imagePath}">
                        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <span class="text-white text-lg font-bold text-center p-4">${photo.nama_foto || ''}</span>
                        </div>
                    </article>
                `;
                galeriContainer.insertAdjacentHTML('beforeend', articleHtml);
            });
            document.querySelectorAll('.gallery-item').forEach(img => {
                img.onclick = function() { openLightbox(this); };
            });
        }
    } catch (e) {
        console.error(e);
    }
}

function setupLightboxListeners() {
    const lightbox = document.getElementById('lightbox');
    const lbClose = document.getElementById('lightbox-close');
    if (lightbox && lbClose) {
        lbClose.onclick = closeLightbox;
        lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
    }
}

async function loadTentangKami() {
    const container = document.getElementById('tentang-kami-container'); 
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE}/konten`);
        const data = await res.json();
        if (data.success && data.data && data.data.tentang_kami) {
            container.innerHTML = data.data.tentang_kami.split(/\r?\n/).filter(p => p.trim() !== '').map(p => `<p class="text-lg leading-relaxed mt-4 text-justify">${p.trim()}</p>`).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

function renderStars(rating) {
    const maxRating = 5;
    const roundedRating = parseFloat(rating); 
    const fullStars = Math.floor(roundedRating);
    const partialStar = roundedRating - fullStars;
    const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
    let html = '';
    for (let i = 1; i <= maxRating; i++) {
        if (i <= fullStars) {
            html += `<svg class="w-5 h-5 fill-current text-yellow-500" viewBox="0 0 24 24"><path d="${STAR_PATH}" /></svg>`;
        } else if (i === fullStars + 1 && partialStar > 0) {
            const pct = Math.round(partialStar * 100);
            const id = `grad-${Math.random().toString(36).substr(2, 5)}`;
            html += `<svg class="w-5 h-5 fill-current text-yellow-500" viewBox="0 0 24 24"><defs><linearGradient id="${id}"><stop offset="${pct}%" stop-color="currentColor"/><stop offset="${pct}%" stop-color="#d1d5db"/></linearGradient></defs><path d="${STAR_PATH}" fill="url(#${id})"/></svg>`;
        } else {
            html += `<svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="${STAR_PATH}" /></svg>`;
        }
    }
    return html;
}

async function loadReviewsSummary() {
    const rateEl = document.getElementById('rata-rata-rating');
    const totalEl = document.getElementById('total-ulasan-text');
    const starsEl = document.getElementById('rating-stars-container');
    if (!rateEl || !totalEl || !starsEl) return;
    try {
        const res = await fetch(`${API_BASE}/ulasan/summary`);
        const result = await res.json();
        if (result.success && result.data) {
            const rating = parseFloat(result.data.rata_rata_rating) || 0;
            rateEl.innerText = `${rating.toFixed(1)} / 5`;
            totalEl.innerText = `Berdasarkan ${result.data.total_ulasan}+ Ulasan`;
            starsEl.innerHTML = renderStars(rating);
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadLatestReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE}/ulasan`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            container.innerHTML = data.data.slice(0, 3).map((rev, i) => `
                <article class="p-4 bg-white rounded-xl shadow-sm border border-gray-100" data-aos="fade-up" data-aos-delay="${(i+1)*100}">
                    <div class="flex items-center justify-between">
                        <div class="font-semibold text-gray-800">${rev.nama_pengulas}</div>
                        <div class="flex items-center text-sm text-yellow-500">
                            <span class="mr-1">${rev.rating_bintang}.0</span>
                            ${'<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'.repeat(rev.rating_bintang)}
                        </div>
                    </div>
                    <p class="mt-2 text-gray-600 italic">"${rev.komentar}"</p>
                    <p class="text-xs text-gray-400 mt-2">Diuulas pada: ${new Date(rev.tanggal_ulasan).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</p>
                </article>
            `).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    setupLightboxListeners(); 
    loadJamOperasional();
    loadMenuPreview(); 
    loadGaleriPreview().then(() => { setupLightboxListeners(); }); 
    loadTentangKami(); 
    loadReviewsSummary();
    loadLatestReviews();
});