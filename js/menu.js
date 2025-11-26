const API_BASE_URL = 'http://localhost:3000/api';
const API_MENU = `${API_BASE_URL}/menu`;

document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');

    if (!menuContainer) {
        console.error("Elemen #menu-container tidak ditemukan. Tidak dapat memuat menu.");
        return;
    }

    function renderMenuItem(item) {
        // Logika fleksibel (dibuat case-insensitive)
        const itemStatus = item.status_menu ? item.status_menu.toLowerCase() : 'tersedia'; 
        const isHabis = itemStatus === 'habis';
        
        // ⭐ PERUBAHAN DI SINI: Warna Tersedia diubah menjadi Kuning Cerah untuk kontras maksimal
        const statusClass = isHabis 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-400 text-gray-900'; // Kuning Cerah dengan Teks Hitam
            
        const statusText = isHabis ? 'Habis' : 'Tersedia';
        const opacityClass = isHabis ? 'opacity-60' : '';

        // Overlay jika Habis (z-20 memastikan menutupi gambar)
        const statusOverlay = isHabis ? `
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <span class="text-xl font-bold text-white uppercase">${statusText}</span>
            </div>
        ` : '';

        const formattedHarga = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(item.harga);

        const imagePath = `../../images/menu/${item.foto}`;

        // Status badge (z-10 dan border-white memastikan badge tampil di atas gambar)
        const statusBadge = `
            <span class="absolute top-3 left-3 inline-block w-auto whitespace-nowrap text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10 border border-white ${statusClass}">
                ${statusText}
            </span>
        `;

        return `
            <article class="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col relative ${opacityClass}">
                <figure class="aspect-[4/3] overflow-hidden relative">
                    <img src="${imagePath}" alt="${item.menu}" class="w-full h-full object-cover hover:scale-105 transition">
                    ${statusOverlay}
                    ${statusBadge}
                </figure>
                <div class="p-5 flex-1 flex flex-col">
                    <h3 class="text-lg font-semibold">${item.menu}</h3>
                    <p class="text-sm text-gray-600 mt-2 flex-1">${item.keterangan_menu || ''}</p> 
                    <div class="mt-4 text-xl font-bold">${formattedHarga}</div>
                </div>
            </article>
        `;
    }

    async function loadMenu() {
        menuContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10">Memuat menu...</p>'; 

        try {
            const response = await fetch(API_MENU);
            
            if (!response.ok) {
                 const errorText = await response.text();
                 try {
                     const errorJson = JSON.parse(errorText);
                     menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat menu: ${errorJson.message || errorText}</p>`;
                 } catch {
                     menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Koneksi server gagal atau respons tidak valid. Periksa konsol untuk detail.</p>`;
                 }
                 return;
            }

            const result = await response.json();

            if (result.success) {
                if (result.data.length === 0) {
                    menuContainer.innerHTML = '<p class="col-span-full text-center py-10 text-gray-500">Belum ada menu yang ditambahkan.</p>';
                    return;
                }

                menuContainer.innerHTML = '';
                result.data.forEach(item => {
                    menuContainer.innerHTML += renderMenuItem(item);
                });
            } else {
                menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Gagal memuat menu: ${result.message}</p>`;
            }
        } catch (error) {
            menuContainer.innerHTML = `<p class="col-span-full text-center py-10 text-red-600">Koneksi server gagal. Pastikan server Node.js berjalan di ${API_BASE_URL}.</p>`;
            console.error('Error fetching menu:', error);
        }
    }

    loadMenu();

    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger');
    const closeX = document.getElementById('close-x');
    const yearElement = document.getElementById('year');

    if (mobileToggle && mobileMenu && hamburger && closeX) {
        mobileToggle.addEventListener('click', function() {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true' || false;
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            hamburger.classList.toggle('hidden');
            closeX.classList.toggle('hidden');
        });
    }

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});