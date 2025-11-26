document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('menu-table-body');
    const formSection = document.getElementById('form-section'); 
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const toggleFormLabel = document.getElementById('toggle-form-label');
    const form = document.getElementById('menu-form');
    const formTitle = document.getElementById('form-title');
    const menuIdInput = document.getElementById('menu-id');
    const menuInput = document.getElementById('menu-name');
    const hargaInput = document.getElementById('menu-price');
    const statusInput = document.getElementById('menu-status');
    const fotoInput = document.getElementById('menu-foto'); 
    const fotoLamaInput = document.getElementById('foto-lama'); 
    const fotoPreviewWrapper = document.getElementById('foto-preview-wrapper');
    const fotoPreview = document.getElementById('foto-preview');
    const submitBtn = document.getElementById('submit-menu');
    const keteranganMenuInput = document.getElementById('menu-description');
    const searchInput = document.getElementById('menu-search'); // Elemen Search Bar

    if (!toggleFormBtn || !formSection || !form) {
        console.error("Kesalahan: Elemen HTML utama tidak ditemukan.");
        return; 
    }

    // Ganti URL dengan yang sesuai di lingkungan Anda
    const API_BASE_URL = 'http://localhost:3000/api'; 
    const API_MENU_URL = `${API_BASE_URL}/menu`;
    const IMAGE_BASE_URL = 'http://localhost:3000/images/menu/'; 
    const DEFAULT_IMAGE_URL = 'http://localhost:3000/images/product/default.png'; 

    let isEditMode = false;
    let allMenuData = []; // Menyimpan semua data menu untuk fungsi pencarian

    function formatRupiah(number) {
        // Pastikan input adalah angka, jika tidak, kembalikan 0
        const num = isNaN(parseFloat(number)) ? 0 : parseFloat(number);
        return new Intl.NumberFormat('id-ID').format(num);
    }

    function toggleFormSection(show = null) {
        const isHidden = formSection.classList.contains('hidden');
        if (show === true || (show === null && isHidden)) {
            formSection.classList.remove('hidden');
            if(toggleFormLabel) toggleFormLabel.textContent = 'Tutup Form';
            toggleFormBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            toggleFormBtn.classList.add('bg-gray-500', 'hover:bg-gray-600');
            formSection.scrollIntoView({ behavior: 'smooth' });
        } else if (show === false || (show === null && !isHidden)) {
            formSection.classList.add('hidden');
            if(toggleFormLabel) toggleFormLabel.textContent = 'Tambah Menu Baru';
            toggleFormBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
            toggleFormBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        }
    }

    function resetForm() {
        form.reset();
        isEditMode = false;
        if (menuIdInput) menuIdInput.value = '';
        if (fotoLamaInput) fotoLamaInput.value = '';
        if (fotoPreviewWrapper) fotoPreviewWrapper.classList.add('hidden');
        if (fotoPreview) fotoPreview.src = '';
        if (formTitle) formTitle.textContent = 'Tambah Menu Baru';
        if (submitBtn) submitBtn.textContent = 'Simpan Menu';
        if (fotoInput) fotoInput.value = ''; 
        // Tombol Batal hanya muncul saat edit
        document.getElementById('cancel-edit-btn')?.classList.add('hidden'); 
        toggleFormSection(false); 
    }

    function renderTableRow(menu) {
        const row = document.createElement('tr');
        const badgeClass = menu.status_menu === 'Tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const fotoUrl = menu.foto ? IMAGE_BASE_URL + menu.foto : DEFAULT_IMAGE_URL; 
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full object-cover"
                            src="${fotoUrl}" alt="${menu.menu}" onerror="this.onerror=null;this.src='${DEFAULT_IMAGE_URL}'">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${menu.menu}</div>
                        <div class="text-xs text-gray-500">${menu.keterangan_menu || 'Tidak ada keterangan'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp ${formatRupiah(menu.harga)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}">${menu.status_menu}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button data-id="${menu.id_menu}" data-menu='${JSON.stringify(menu)}' class="edit-btn text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button data-id="${menu.id_menu}" class="delete-btn text-red-600 hover:text-red-900">Hapus</button>
            </td>
        `;
        return row;
    }

    function displayMenu(menuArray) {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (menuArray.length > 0) {
            menuArray.forEach(menu => {
                tableBody.appendChild(renderTableRow(menu));
            });
            attachEventListeners();
        } else {
            tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Menu tidak ditemukan.</td></tr>';
        }
    }
    
    // 2. FUNGSI SEARCH BAR
    function filterMenu() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            displayMenu(allMenuData); // Tampilkan semua jika kosong
            return;
        }

        const filtered = allMenuData.filter(menu => {
            return (
                menu.menu.toLowerCase().includes(searchTerm) ||
                (menu.keterangan_menu && menu.keterangan_menu.toLowerCase().includes(searchTerm)) ||
                menu.status_menu.toLowerCase().includes(searchTerm) ||
                String(menu.harga).includes(searchTerm)
            );
        });

        displayMenu(filtered);
    }
    
    // Ganti loadMenuTable untuk menyimpan data ke allMenuData
    async function loadMenuTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Memuat data...</td></tr>';
        try {
            const response = await fetch(API_MENU_URL);
            
            // --- PERBAIKAN: Baca body response hanya sekali sebagai teks ---
            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Gagal mengambil data menu. Server mengembalikan status ${response.status}.`;
                
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    console.error('Server mengembalikan konten non-JSON:', responseText.substring(0, 200) + '...');
                    if (response.status === 404) {
                        errorMessage = 'Rute API tidak ditemukan (404).';
                    }
                }
                throw new Error(errorMessage);
            }

            // Jika response.ok, parse teks yang sudah dibaca sebagai JSON
            const result = JSON.parse(responseText); 

            if (result.success && result.data) {
                // Simpan data ke variabel global dan tampilkan
                allMenuData = result.data;
                displayMenu(allMenuData);
            } else {
                allMenuData = [];
                tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Belum ada menu yang ditambahkan.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading menu:', error);
            tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">⚠️ Error koneksi/server: ${error.message}</td></tr>`;
            allMenuData = [];
        }
    }

    function handleEdit(menuData) {
        isEditMode = true;
        if (menuIdInput) menuIdInput.value = menuData.id_menu;
        if (menuInput) menuInput.value = menuData.menu;
        // Pastikan harga adalah float dan tidak null sebelum dimasukkan ke valueAsNumber
        if (hargaInput && menuData.harga != null) hargaInput.valueAsNumber = parseFloat(menuData.harga); 
        if (statusInput) statusInput.value = menuData.status_menu;
        if (keteranganMenuInput) keteranganMenuInput.value = menuData.keterangan_menu || ''; 
        
        // Simpan nama file lama
        if (fotoLamaInput) fotoLamaInput.value = menuData.foto || ''; 
        
        if (menuData.foto && fotoPreview) {
            fotoPreview.src = IMAGE_BASE_URL + menuData.foto;
            if (fotoPreviewWrapper) fotoPreviewWrapper.classList.remove('hidden');
        } else {
            if (fotoPreview) fotoPreview.src = DEFAULT_IMAGE_URL; 
            if (fotoPreviewWrapper) fotoPreviewWrapper.classList.add('hidden');
        }
        
        if (fotoInput) fotoInput.value = ''; // Kosongkan input file
        
        if (formTitle) formTitle.textContent = `Edit Menu: ${menuData.menu}`;
        if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
        // Tampilkan tombol batal
        document.getElementById('cancel-edit-btn')?.classList.remove('hidden');
        
        toggleFormSection(true); 
    }

    async function handleDelete(id) {
        if (!confirm(`Yakin ingin menghapus menu ID ${id}? (Ini juga akan menghapus file foto).`)) return;

        try {
            const response = await fetch(`${API_MENU_URL}/${id}`, {
                method: 'DELETE',
            });
            
            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = 'Gagal menghapus menu.';
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    console.error("Respons Error Non-JSON diterima:", responseText.substring(0, 100) + '...');
                    errorMessage = `Server Error (${response.status}).`;
                }
                throw new Error(errorMessage);
            }
            
            const result = JSON.parse(responseText);

            alert('Menu berhasil dihapus!');
            loadMenuTable();
        } catch (error) {
            console.error('Error deleting menu:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    // 1. PERBAIKAN FUNGSI TAMBAH/EDIT MENU
    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!form) return; 

        const formData = new FormData(form); 
        
        const menuValue = formData.get('menu');
        const hargaValue = formData.get('harga');
        
        if (!menuValue || !hargaValue) {
             alert("Nama Menu dan Harga wajib diisi.");
             return;
        }

        // Hanya wajibkan foto saat mode tambah baru
        if (!isEditMode && fotoInput && fotoInput.files.length === 0) {
            alert("Foto wajib diunggah untuk menu baru.");
            return;
        }
        
        if (isEditMode && fotoInput && fotoInput.files.length === 0) {
            formData.delete('foto_menu'); 
        } else if (!isEditMode && formData.has('foto_lama')) {
             // Pastikan foto_lama tidak terkirim saat mode tambah baru
             formData.delete('foto_lama');
        }
        
        // Pastikan status_menu selalu ada, meskipun tidak diubah (ini penting untuk PUT)
        if (statusInput && !formData.has('status_menu')) {
             formData.append('status_menu', statusInput.value);
        }
        
        const method = isEditMode ? 'POST' : 'POST'; 
        const id = menuIdInput ? formData.get('menu_id') : '';
        const url = isEditMode ? `${API_MENU_URL}/${id}` : API_MENU_URL;
        
        const fetchOptions = {
            method: isEditMode ? 'PUT' : 'POST', 
            body: formData,
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = isEditMode ? 'Menyimpan...' : 'Menambahkan...';
        }

        try {
            const response = await fetch(url, fetchOptions);

            const responseText = await response.text();
            
            if (!response.ok) {
                let errorMessage = `Gagal ${isEditMode ? 'memperbarui' : 'menambah'} menu. Status: ${response.status}.`;

                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    console.error("Respons Error Non-JSON diterima:", responseText.substring(0, 100) + '...');
                    errorMessage = `Server Error (${response.status}). Cek konsol untuk detail non-JSON.`;
                }

                throw new Error(errorMessage);
            }

            const result = JSON.parse(responseText);

            if (result.success) {
                 alert(`Menu berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
            } else {
                 throw new Error(result.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambah'} menu.`);
            }
            
            resetForm();
            loadMenuTable();

        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Error: ${error.message}`);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = isEditMode ? 'Simpan Perubahan' : 'Simpan Menu';
            }
        }
    }

    function attachEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            // Hapus event listener lama jika ada
            btn.removeEventListener('click', handleEditClick); 
            btn.addEventListener('click', handleEditClick);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            // Hapus event listener lama jika ada
            btn.removeEventListener('click', handleDeleteClick);
            btn.addEventListener('click', handleDeleteClick);
        });
    }

    function handleEditClick(e) {
        // Karena data-menu ada di button, kita parse data dari sana
        const menuData = JSON.parse(e.currentTarget.dataset.menu);
        handleEdit(menuData);
    }

    function handleDeleteClick(e) {
        const idToDelete = e.currentTarget.dataset.id;
        handleDelete(idToDelete);
    }
    
    // Inisialisasi event listener utama
    form.addEventListener('submit', handleFormSubmit);
    
    toggleFormBtn.addEventListener('click', () => {
        if (formSection.classList.contains('hidden')) {
            resetForm(); // Pastikan form bersih sebelum buka untuk tambah baru
            toggleFormSection(true);
        } else {
            resetForm(); // Tutup dan reset form
        }
    });
    
    // Event listener untuk tombol Batal
    document.getElementById('cancel-edit-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetForm();
    });

    if (fotoInput) {
        fotoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (fotoPreview) fotoPreview.src = event.target.result;
                    if (fotoPreviewWrapper) fotoPreviewWrapper.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else if (isEditMode && fotoLamaInput && fotoLamaInput.value) {
                // Saat mode edit, jika file dibatalkan, tampilkan foto lama
                if (fotoPreview) fotoPreview.src = IMAGE_BASE_URL + fotoLamaInput.value;
                if (fotoPreviewWrapper) fotoPreviewWrapper.classList.remove('hidden');
            } else {
                // Mode tambah baru, atau mode edit tanpa foto lama
                if (fotoPreview) fotoPreview.src = '';
                if (fotoPreviewWrapper) fotoPreviewWrapper.classList.add('hidden');
            }
        });
    }
    
    // 2. FUNGSI SEARCH BAR - Tambahkan Event Listener
    if (searchInput) {
        searchInput.addEventListener('keyup', filterMenu);
        searchInput.addEventListener('change', filterMenu);
    }
    
    const yearEl = document.getElementById('year-menu');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    loadMenuTable();
});