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
    const kategoriInput = document.getElementById('menu-category');
    const fotoInput = document.getElementById('menu-foto');
    const fotoLamaInput = document.getElementById('foto-lama');
    const fotoPreviewWrapper = document.getElementById('foto-preview-wrapper');
    const fotoPreview = document.getElementById('foto-preview');
    const submitBtn = document.getElementById('submit-menu');
    const keteranganMenuInput = document.getElementById('menu-description');
    const searchInput = document.getElementById('menu-search');

    if (!toggleFormBtn || !formSection || !form) {
        return;
    }

    const API_BASE_URL = 'http://localhost:3000/api';
    const API_MENU_URL = `${API_BASE_URL}/menu`;
    const IMAGE_BASE_URL = 'http://localhost:3000/images/menu/';
    const DEFAULT_IMAGE_URL = 'http://localhost:3000/images/product/default.png';

    let isEditMode = false;
    let allMenuData = [];

    function formatRupiah(number) {
        const num = isNaN(parseFloat(number)) ? 0 : parseFloat(number);
        return new Intl.NumberFormat('id-ID').format(num);
    }

    function getKategoriBadge(kategori) {
        if (kategori === 'utama') {
            return '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Utama</span>';
        } else {
            return '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Tambahan</span>';
        }
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
        document.getElementById('cancel-edit-btn')?.classList.add('hidden');
        toggleFormSection(false);
    }

    function renderTableRow(menu) {
        const row = document.createElement('tr');
        const statusBadgeClass = menu.status_menu === 'Tersedia' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const statusText = menu.status_menu === 'Tersedia' ? 'Tampil' : 'Sembunyi';
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
            <td class="px-6 py-4 whitespace-nowrap">
                ${getKategoriBadge(menu.kategori_menu || 'tambahan')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp ${formatRupiah(menu.harga)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}">${statusText}</span>
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
            tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Menu tidak ditemukan.</td></tr>';
        }
    }

    function filterMenu() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            displayMenu(allMenuData);
            return;
        }

        const filtered = allMenuData.filter(menu => {
            return (
                menu.menu.toLowerCase().includes(searchTerm) ||
                (menu.keterangan_menu && menu.keterangan_menu.toLowerCase().includes(searchTerm)) ||
                menu.status_menu.toLowerCase().includes(searchTerm) ||
                (menu.kategori_menu && menu.kategori_menu.toLowerCase().includes(searchTerm)) ||
                String(menu.harga).includes(searchTerm)
            );
        });

        displayMenu(filtered);
    }

    async function loadMenuTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Memuat data...</td></tr>';
        try {
            const response = await fetch(API_MENU_URL);
            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = `Gagal mengambil data menu. Server mengembalikan status ${response.status}.`;
                
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    if (response.status === 404) {
                        errorMessage = 'Rute API tidak ditemukan (404).';
                    }
                }
                throw new Error(errorMessage);
            }

            const result = JSON.parse(responseText);

            if (result.success && result.data) {
                allMenuData = result.data;
                displayMenu(allMenuData);
            } else {
                allMenuData = [];
                tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Belum ada menu yang ditambahkan.</td></tr>';
            }
        } catch (error) {
            console.error('Error loading menu:', error);
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">⚠️ Error koneksi/server: ${error.message}</td></tr>`;
            allMenuData = [];
        }
    }

    function handleEdit(menuData) {
        isEditMode = true;
        if (menuIdInput) menuIdInput.value = menuData.id_menu;
        if (menuInput) menuInput.value = menuData.menu;
        if (hargaInput && menuData.harga != null) hargaInput.valueAsNumber = parseFloat(menuData.harga);
        if (statusInput) statusInput.value = menuData.status_menu;
        if (kategoriInput) kategoriInput.value = menuData.kategori_menu || '';
        if (keteranganMenuInput) keteranganMenuInput.value = menuData.keterangan_menu || '';
        
        if (fotoLamaInput) fotoLamaInput.value = menuData.foto || '';
        
        if (menuData.foto && fotoPreview) {
            fotoPreview.src = IMAGE_BASE_URL + menuData.foto;
            if (fotoPreviewWrapper) fotoPreviewWrapper.classList.remove('hidden');
        } else {
            if (fotoPreview) fotoPreview.src = DEFAULT_IMAGE_URL;
            if (fotoPreviewWrapper) fotoPreviewWrapper.classList.add('hidden');
        }
        
        if (fotoInput) fotoInput.value = '';
        
        if (formTitle) formTitle.textContent = `Edit Menu: ${menuData.menu}`;
        if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';
        document.getElementById('cancel-edit-btn')?.classList.remove('hidden');
        
        toggleFormSection(true);
    }

    async function handleDelete(id) {
        if (!confirm(`Yakin ingin menghapus menu ini?`)) return;

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

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!form) return;

        const formData = new FormData(form);
        
        const menuValue = formData.get('menu');
        const hargaValue = formData.get('harga');
        const kategoriValue = formData.get('kategori_menu');
        
        if (!menuValue || !hargaValue || !kategoriValue) {
             alert("Nama Menu, Kategori, dan Harga wajib diisi.");
             return;
        }

        if (!isEditMode && fotoInput && fotoInput.files.length === 0) {
            alert("Foto wajib diunggah untuk menu baru.");
            return;
        }
        
        if (isEditMode && fotoInput && fotoInput.files.length === 0) {
            formData.delete('foto_menu');
        } else if (!isEditMode && formData.has('foto_lama')) {
             formData.delete('foto_lama');
        }
        
        if (statusInput && !formData.has('status_menu')) {
             formData.append('status_menu', statusInput.value);
        }
        
        if (kategoriInput && !formData.has('kategori_menu')) {
             formData.append('kategori_menu', kategoriInput.value);
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
            btn.removeEventListener('click', handleEditClick);
            btn.addEventListener('click', handleEditClick);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.removeEventListener('click', handleDeleteClick);
            btn.addEventListener('click', handleDeleteClick);
        });
    }

    function handleEditClick(e) {
        const menuData = JSON.parse(e.currentTarget.dataset.menu);
        handleEdit(menuData);
    }

    function handleDeleteClick(e) {
        const idToDelete = e.currentTarget.dataset.id;
        handleDelete(idToDelete);
    }
    
    form.addEventListener('submit', handleFormSubmit);
    
    toggleFormBtn.addEventListener('click', () => {
        if (formSection.classList.contains('hidden')) {
            resetForm();
            toggleFormSection(true);
        } else {
            resetForm();
        }
    });
    
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
                if (fotoPreview) fotoPreview.src = IMAGE_BASE_URL + fotoLamaInput.value;
                if (fotoPreviewWrapper) fotoPreviewWrapper.classList.remove('hidden');
            } else {
                if (fotoPreview) fotoPreview.src = '';
                if (fotoPreviewWrapper) fotoPreviewWrapper.classList.add('hidden');
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', filterMenu);
        searchInput.addEventListener('change', filterMenu);
    }
    
    const yearEl = document.getElementById('year-menu');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    loadMenuTable();
});