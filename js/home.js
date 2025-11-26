const API_BASE = 'http://localhost:3000/api';

async function loadJamOperasional() {
    try {
        const res = await fetch(`${API_BASE}/informasi-toko`);
        const j = await res.json();
        
        if (j.success && j.data) {
            
            // 1. Menampilkan Jam Operasional
            const jamOperasionalEl = document.getElementById('jam-operasional');
            if (jamOperasionalEl && j.data.jam_operasional) {
                jamOperasionalEl.innerText = j.data.jam_operasional;
            }
            
            // 2. Menampilkan ALAMAT
            const alamatTokoEl = document.getElementById('alamat-toko');
            if (alamatTokoEl && j.data.alamat_lengkap) {
                alamatTokoEl.innerText = j.data.alamat_lengkap;
            }

            // 3. Menampilkan Link Gmaps
            const gmapsLinkElement = document.getElementById('gmaps-link'); 
            if (gmapsLinkElement && j.data.lokasi_gmaps_link) {
                gmapsLinkElement.href = j.data.lokasi_gmaps_link;
                gmapsLinkElement.target = '_blank';
            }
            
            // ⭐ BARU: 4. Menampilkan Link WhatsApp (Pesan Via Wa)
            const waNumber = j.data.nomor_whatsapp ? j.data.nomor_whatsapp.replace(/\s/g, '').replace(/[-\(\)]/g, '') : null;
            const waLinkElement = document.querySelector('.hero-btn-order');
            if (waLinkElement && waNumber) {
                // Mengatur href tautan order di Hero Section
                waLinkElement.href = `https://wa.me/${waNumber}`; 
            }
            // Mengatur href tautan WhatsApp di Order Section (opsional, karena biasanya link ini sudah ada di HTML)
            const waOrderSectionLink = document.querySelector('.marquee-list a[aria-label="Order via WhatsApp"]');
            if (waOrderSectionLink && waNumber) {
                waOrderSectionLink.href = `https://wa.me/${waNumber}`;
            }
        }
    } catch (e) {
        console.error('Gagal memuat informasi toko:', e);
    }
}

async function loadMenuPreview() {
    try {
        const res = await fetch(`${API_BASE}/menu/latest`); 
        const result = await res.json();
        
        const menuContainer = document.getElementById('menu-preview-container'); 
        const menuLinkContainer = document.getElementById('menu-link-container'); // Ambil container tautan
        if (!menuContainer) return;
        
        menuContainer.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Memuat menu...</p>';
        if (menuLinkContainer) menuLinkContainer.classList.add('hidden'); // Sembunyikan tautan saat memuat

        if (result.success && result.data && result.data.length > 0) {
            // ⭐ MODIFIED: Limit the data to the first 4 items for the preview on the home page
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
                const statusOverlay = isHabis ? 
                    `<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span class="text-xl font-bold text-white uppercase">Habis</span>
                    </div>` 
                    : '';

                return `
                    <article class="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl ${opacityClass}">
                        <div class="relative w-full h-40">
                            <img src="${fotoPath}" alt="Foto Menu ${item.menu}" 
                                class="w-full h-full object-cover">
                            ${statusOverlay}
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-lg text-[#706442]">${item.menu}</h3>
                            <p class="text-gray-900 font-semibold mt-1">${formattedHarga}</p>
                            <p class="text-sm text-gray-500 line-clamp-2">${item.keterangan_menu || 'Keterangan tidak tersedia.'}</p>
                        </div>
                    </article>
                `;
            }).join('');
            
            // Tampilkan tautan jika ada menu yang dimuat
            if (menuLinkContainer) menuLinkContainer.classList.remove('hidden'); 
            
        } else {
            menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">Menu belum tersedia.</p>`;
             // Pastikan tautan tetap disembunyikan jika tidak ada menu
            if (menuLinkContainer) menuLinkContainer.classList.add('hidden'); 
        }
    } catch (e) {
        console.error('Gagal memuat menu preview:', e);
        const menuContainer = document.getElementById('menu-preview-container');
        if (menuContainer) menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat menu. Cek server API Anda.</p>`;
        // Sembunyikan tautan jika terjadi error
        const menuLinkContainer = document.getElementById('menu-link-container');
        if (menuLinkContainer) menuLinkContainer.classList.add('hidden'); 
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
        
        galeriContainer.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Memuat galeri...</p>';

        if (j.success && j.data && j.data.length > 0) {
            galeriContainer.innerHTML = ''; 
            
            // MODIFIKASI: Batasi data hanya 4 item untuk preview di halaman beranda
            const galeriPreview = j.data.slice(0, 4); 

            galeriPreview.forEach(photo => {
                const imagePath = `/${photo.path_file}`; 
                
                const articleHtml = `
                    <article class="relative overflow-hidden group rounded-lg shadow-lg cursor-pointer aspect-[4/3]">
                        <img loading="lazy" decoding="async" src="${imagePath}"
                            alt="${photo.nama_foto || 'Foto Galeri'}"
                            class="w-full h-full object-cover transition duration-300 group-hover:scale-105 gallery-item" 
                            data-full-src="${imagePath}">
                        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <span class="text-white text-lg font-bold text-center p-4">${photo.nama_foto ? photo.nama_foto : 'Lihat Foto'}</span>
                        </div>
                    </article>
                `;
                galeriContainer.insertAdjacentHTML('beforeend', articleHtml);
            });
            
            document.querySelectorAll('.gallery-item').forEach(img => {
                img.addEventListener('click', function() {
                    openLightbox(this);
                });
            });
            
        } else if (galeriContainer) {
            galeriContainer.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">Galeri foto belum tersedia.</p>`;
        }
    } catch (e) {
        console.error('Gagal memuat galeri:', e);
        const galeriContainer = document.getElementById('galeri-preview-container');
        if (galeriContainer) galeriContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat galeri. Cek server API Anda.</p>`;
    }
}

function setupLightboxListeners() {
    const lightbox = document.getElementById('lightbox');
    const lbClose = document.getElementById('lightbox-close');

    if (lightbox && lbClose) {
        lbClose.onclick = closeLightbox;
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeLightbox();
        };
    }
}

async function loadTentangKami() {
    // ⭐ MODIFIED: Menggunakan ID yang ada di HTML: 'tentang-kami-container'
    const tentangKamiContainer = document.getElementById('tentang-kami-container'); 
    const kontenApiUrl = `${API_BASE}/konten`; 

    if (tentangKamiContainer) {
        tentangKamiContainer.innerHTML = '<p class="text-gray-500">Memuat...</p>';
        try {
            const response = await fetch(kontenApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.data && data.data.tentang_kami) {
                const tentangKamiText = data.data.tentang_kami;
                
                const paragraphs = tentangKamiText.split(/\r?\n/).filter(p => p.trim() !== ''); 
                let htmlContent = '';
                
                paragraphs.forEach((p) => {
                    // ⭐ MODIFIED: Tambahkan kelas text-justify pada paragraf yang dimuat
                    htmlContent += `<p class="text-lg leading-relaxed mt-4 text-justify">${p.trim()}</p>`;
                });
                
                tentangKamiContainer.innerHTML = htmlContent;

            } else {
                tentangKamiContainer.innerHTML = '<p class="text-lg leading-relaxed mt-4 text-gray-500">Konten "Tentang Kami" belum diatur.</p>';
            }
        } catch (error) {
            console.error('Gagal memuat data Tentang Kami:', error);
            tentangKamiContainer.innerHTML = '<p class="text-lg leading-relaxed mt-4 text-red-500">Gagal memuat konten. Cek server API Anda.</p>';
        }
    }
}

function renderStars(rating) {
    const maxRating = 5;
    const roundedRating = parseFloat(rating); 
    const fullStars = Math.floor(roundedRating);
    const partialStar = roundedRating - fullStars;
    const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
    let finalStarHtml = '';

    for (let i = 1; i <= maxRating; i++) {
        if (i <= fullStars) {
            finalStarHtml += `<svg class="w-5 h-5 fill-current text-yellow-500" viewBox="0 0 24 24"><path d="${STAR_PATH}" /></svg>`;
        } else if (i === fullStars + 1 && partialStar > 0) {
            const fillPercentage = Math.round(partialStar * 100);
            const uniqueId = `grad-rev-${Math.random().toString(36).substring(2, 9)}`; 
            
            finalStarHtml += `
                <svg class="w-5 h-5 fill-current text-yellow-500" viewBox="0 0 24 24">
                    <defs>
                        <linearGradient id="${uniqueId}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="${fillPercentage}%" style="stop-color:currentColor;stop-opacity:1" />
                            <stop offset="${fillPercentage}%" style="stop-color:#d1d5db;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="${STAR_PATH}" fill="url(#${uniqueId})" />
                </svg>
            `;
        } else {
             finalStarHtml += `<svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="${STAR_PATH}" /></svg>`;
        }
    }
    return finalStarHtml;
}


async function loadReviewsSummary() {
    const ratingElement = document.getElementById('rata-rata-rating');
    const totalElement = document.getElementById('total-ulasan-text');
    const starsContainer = document.getElementById('rating-stars-container');

    if (!ratingElement || !totalElement || !starsContainer) return;
    
    ratingElement.innerText = 'Memuat...';
    totalElement.innerText = 'Memuat jumlah ulasan...';
    starsContainer.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/ulasan/summary`);
        const result = await res.json();

        if (result.success && result.data) {
            const { rata_rata_rating, total_ulasan } = result.data;
            const ratingNumber = parseFloat(rata_rata_rating) || 0;

            ratingElement.innerText = `${ratingNumber.toFixed(1)} / 5`;
            totalElement.innerText = `Berdasarkan ${total_ulasan}+ Ulasan`;
            starsContainer.innerHTML = renderStars(ratingNumber);

        } else {
            ratingElement.innerText = '0.0 / 5';
            totalElement.innerText = 'Berdasarkan 0+ Ulasan';
            starsContainer.innerHTML = renderStars(0);
        }

    } catch (e) {
        console.error('Gagal memuat ringkasan ulasan:', e);
        ratingElement.innerText = 'Error';
        totalElement.innerText = 'Gagal memuat data';
        starsContainer.innerHTML = '';
    }
}

async function loadLatestReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    const ulasanApiUrl = `${API_BASE}/ulasan`; 

    if (!reviewsContainer) return;

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('id-ID', options);
    }

    // ⭐ MODIFIKASI: Menerima parameter index untuk penentuan delay AOS
    function createReviewElement(review, index) { 
        const article = document.createElement('article');
        article.className = 'p-4 bg-white rounded-xl shadow-sm border border-gray-100'; 

        const reviewDate = formatDate(review.tanggal_ulasan); 
        const starSvg = '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
        const starRatingHtml = starSvg.repeat(review.rating_bintang);

        article.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="font-semibold text-gray-800">${review.nama_pengulas}</div>
                <div class="flex items-center text-sm text-yellow-500">
                    <span class="mr-1">${review.rating_bintang}.0</span>
                    ${starRatingHtml}
                </div>
            </div>
            <p class="mt-2 text-gray-600 italic">"${review.komentar}"</p>
            <p class="text-xs text-gray-400 mt-2">Diuulas pada: ${reviewDate}</p>
        `;
        
        // Tambahkan AOS attribute secara dinamis (fade-up dengan delay minimal)
        article.setAttribute('data-aos', 'fade-up');
        article.setAttribute('data-aos-delay', (index + 1) * 100);

        return article;
    }

    reviewsContainer.innerHTML = '<p class="text-gray-500 text-center">Memuat ulasan...</p>';
    try {
        const response = await fetch(ulasanApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            reviewsContainer.innerHTML = '';
            
            // ⭐ MODIFIKASI UTAMA: Batasi data hanya 3 item terbaru
            const latestReviews = data.data.slice(0, 3);
            
            latestReviews.forEach((review, index) => { 
                const reviewElement = createReviewElement(review, index); // index diteruskan
                reviewsContainer.appendChild(reviewElement);
            });
        } else {
            reviewsContainer.innerHTML = '<p class="text-gray-500 text-center">Belum ada ulasan terbaru.</p>';
        }
    } catch (error) {
        console.error('Error saat memuat ulasan:', error);
        reviewsContainer.innerHTML = '<p class="text-red-500 text-center">Gagal memuat ulasan. Cek server API Anda.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    setupLightboxListeners(); 
    loadJamOperasional();
    loadMenuPreview(); 
    loadGaleriPreview().then(() => {
        setupLightboxListeners(); 
    }); 
    loadTentangKami(); 
    loadReviewsSummary();
    loadLatestReviews(); // Memuat 3 ulasan terbaru dengan animasi minimal
});