const API_BASE_URL = 'http://localhost:3000/api';
// PERBAIKAN: Mengganti '/gallery' menjadi '/galeri' agar sesuai dengan server.js
const API_GALLERY = `${API_BASE_URL}/galeri`; 

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!galleryContainer) {
        return;
    }

    function renderGalleryItem(item) {
        const imageSrc = `../../${item.path_file}`; 
        
        return `
            <figure class="group aspect-square overflow-hidden rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition duration-300 relative gallery-figure"
                    data-image-src="${imageSrc}" 
                    data-image-alt="${item.nama_foto}">
                <img src="${imageSrc}" alt="${item.nama_foto}" class="gallery-item w-full h-full object-cover" loading="lazy">
                <div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span class="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Lihat</span>
                </div>
            </figure>
        `;
    }

    function setupLightboxListeners() {
        const galleryItems = galleryContainer.querySelectorAll('.gallery-figure');

        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const src = this.getAttribute('data-image-src');
                const alt = this.getAttribute('data-image-alt');
                
                lightboxImg.src = src;
                lightboxImg.alt = alt;
                lightbox.classList.remove('hidden');
                lightbox.classList.add('flex');
            });
        });
    }

    async function loadGallery() {
        galleryContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Memuat galeri foto...</p>';

        try {
            const response = await fetch(API_GALLERY);
            
            if (!response.ok) {
                 const errorText = await response.text();
                 galleryContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat galeri. (Status: ${response.status})</p>`;
                 return;
            }

            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                galleryContainer.innerHTML = '';
                result.data.forEach(item => {
                    galleryContainer.innerHTML += renderGalleryItem(item);
                });
                
                setupLightboxListeners();
                
            } else if (result.success && result.data.length === 0) {
                galleryContainer.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Belum ada foto yang ditambahkan ke galeri.</p>';
            } else {
                 galleryContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat galeri: ${result.message || 'Data tidak tersedia.'}</p>`;
            }
        } catch (error) {
            galleryContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Koneksi server gagal. Pastikan server Node.js berjalan di ${API_BASE_URL}.</p>`;
        }
    }

    if (lightbox && lightboxClose) {
        const closeLightbox = () => {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
            lightboxImg.src = '';
            lightboxImg.alt = '';
        };

        lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    loadGallery();
});