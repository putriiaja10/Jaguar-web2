const API_PESANAN = 'http://localhost:3000/api/pesanan';
const ordersTableBody = document.getElementById('orders-table-body');
const detailModal = document.getElementById('detail-modal');
const closeDetailModalBtn = document.getElementById('close-detail-modal');

const detailId = document.getElementById('detail-id');
const detailCustomerName = document.getElementById('detail-customer-name');
const detailWhatsapp = document.getElementById('detail-whatsapp');
const detailTime = document.getElementById('detail-time');
const detailStatus = document.getElementById('detail-status');
const detailItems = document.getElementById('detail-items');
const detailTotal = document.getElementById('detail-total');
const detailWaLink = document.getElementById('detail-wa-link');

let allOrders = [];

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Menunggu Konfirmasi':
            return 'bg-yellow-100 text-yellow-800';
        case 'Dikonfirmasi':
        case 'Sedang Diproses':
            return 'bg-blue-100 text-blue-800';
        case 'Selesai':
            return 'bg-green-100 text-green-800';
        case 'Dibatalkan':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatDateTime(datetimeString) {
    const date = new Date(datetimeString);
    const options = {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    };
    return date.toLocaleDateString('id-ID', options).replace(/\./g, '');
}

/**
 * Membersihkan dan memformat nomor WhatsApp agar selalu diawali dengan '62' 
 * dan menghapus karakter non-digit (termasuk '+'). (Fungsi tambahan dari jawaban sebelumnya)
 * @param {string} number Nomor telepon mentah.
 * @returns {string} Nomor WhatsApp yang diformat ('62...' tanpa karakter non-digit).
 */
function cleanWhatsappNumber(number) {
    if (!number) return '';

    // 1. Hapus semua karakter non-digit, termasuk '+' (yang diubah jadi digit 0)
    let cleaned = String(number).replace(/\D/g, '');

    // 2. Periksa prefix
    if (cleaned.startsWith('0')) {
        // Ganti '0' di awal dengan '62' (misal: 0812... -> 62812...)
        return '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('62')) {
        // Sudah diawali '62' (misal: 62812...)
        return cleaned;
    } else if (cleaned.length >= 8) { 
        // Ini adalah fallback untuk nomor yang hanya berupa 8xx... tanpa 0 atau 62 di awal
        return '62' + cleaned;
    }
    
    return cleaned;
}

function renderOrderTable(ordersData) {
    ordersTableBody.innerHTML = ordersData.map(order => {
        const currentStatus = order.status_pesanan || 'Menunggu Konfirmasi';
        const badgeClass = getStatusBadgeClass(currentStatus);
        const formattedTotal = formatRupiah(order.jumlah_total);
        const formattedTime = formatDateTime(order.waktu_pesanan);
        
        const isCompletedOrCancelled = currentStatus === 'Selesai' || currentStatus === 'Dibatalkan';

        // Menggunakan id jika id_pesanan tidak ada (misalnya dari data API yang menggunakan id numerik)
        const orderId = order.id_pesanan || order.id; 

        let actionButtons = `<button data-id="${orderId}" data-action="detail" class="text-indigo-600 hover:text-indigo-900 mr-3">Detail</button>`;
        
        if (currentStatus === 'Menunggu Konfirmasi') {
            actionButtons += `<button data-id="${orderId}" data-action="confirm" class="text-green-600 hover:text-green-900 mr-3">Konfirmasi</button>`;
            actionButtons += `<button data-id="${orderId}" data-action="cancel" class="text-red-600 hover:text-red-900">Batal</button>`;

        } else if (currentStatus === 'Dikonfirmasi' || currentStatus === 'Sedang Diproses') {
            actionButtons += `<button data-id="${orderId}" data-action="complete" class="text-green-600 hover:text-green-900 mr-3">Selesai</button>`;
            actionButtons += `<button data-id="${orderId}" data-action="cancel" class="text-red-600 hover:text-red-900">Batal</button>`;

        } else if (isCompletedOrCancelled) {
             actionButtons += `<button disabled class="text-gray-400 cursor-not-allowed">${currentStatus}</button>`;
        }

        // Menambahkan data-total dan data-status ke tr untuk keperluan updateOrderStatus (dari API atau data lokal)
        return `
            <tr data-id="${orderId}" data-total="${order.jumlah_total}" data-status="${currentStatus}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${orderId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${formattedTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${order.nama_pelanggan}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">${formattedTotal}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}">
                        ${currentStatus}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${actionButtons}
                </td>
            </tr>
        `;
    }).join('');

    if (ordersData.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Tidak ada pesanan yang cocok dengan pencarian.</td></tr>';
    }
}

function openDetailModal(order) {
    detailId.textContent = order.id_pesanan || order.id; 
    detailCustomerName.textContent = order.nama_pelanggan;
    detailWhatsapp.textContent = order.nomor_whatsapp;
    detailTime.textContent = formatDateTime(order.waktu_pesanan);
    detailTotal.textContent = formatRupiah(order.jumlah_total);
    detailStatus.textContent = order.status_pesanan;
    detailStatus.className = `font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(order.status_pesanan)}`;
    
    // MENGGUNAKAN FUNGSI cleanWhatsappNumber: untuk memastikan tautan WhatsApp benar
    const waNumber = cleanWhatsappNumber(order.nomor_whatsapp);
    detailWaLink.href = `https://wa.me/${waNumber}`;

    let detailHTML = '<p class="text-gray-500">Tidak ada rincian menu.</p>';
    let detailPesananData = order.detail_pesanan;
    
    try {
        const details = typeof detailPesananData === 'string' ? JSON.parse(detailPesananData) : detailPesananData;

        if (Array.isArray(details) && details.length > 0) {
            detailHTML = details.map(item => {
                // Handle kasus item.menu yang tidak lengkap pada data hardcoded
                const menuName = item.menu || 'Menu Tidak Diketahui'; 
                return `
                    <p class="text-gray-700">
                        <span class="font-semibold">${menuName}</span>: 
                        ${item.qty} pcs @ ${formatRupiah(item.price)} 
                        (<span class="font-medium">${formatRupiah(item.subtotal)}</span>)
                    </p>
                `;
            }).join('');
        } else if (typeof detailPesananData === 'string' && detailPesananData.trim().length > 0) {
            // Fallback untuk format teks biasa (misalnya: "Bubur Ayam x1 (Rp 12.000);")
            const formattedText = detailPesananData.replace(/;/g, ';\n').trim();
            detailHTML = `<p class="text-sm text-gray-700 whitespace-pre-line">${formattedText}</p>`;
        }
    } catch (e) {
        // Fallback jika parsing JSON gagal
        if (typeof detailPesananData === 'string' && detailPesananData.trim().length > 0) {
            const formattedText = detailPesananData.replace(/;/g, ';\n').trim();
            detailHTML = `<p class="text-sm text-gray-700 whitespace-pre-line">${formattedText}</p>`;
        }
        console.warn('Gagal parsing detail_pesanan sebagai JSON, beralih ke teks biasa:', e);
    }
    
    detailItems.innerHTML = detailHTML;

    detailModal.classList.remove('hidden');
}

async function loadOrders() {
    // Mengambil data dari baris HTML yang sudah ada (hardcoded)
    const staticOrders = Array.from(ordersTableBody.querySelectorAll('tr')).map(row => {
        const orderData = row.dataset.order;
        if (orderData) {
            try {
                const order = JSON.parse(orderData);
                // Tambahkan data-id dan data-status yang ada di <tr>
                order.id = row.dataset.id; 
                order.status_pesanan = row.dataset.status; 
                return order;
            } catch (e) {
                console.error(`Gagal parse JSON pada ID ${row.dataset.id}:`, e);
                return null;
            }
        }
        return null;
    }).filter(order => order !== null);


    // Menampilkan pesan loading untuk data API
    if (ordersTableBody.children.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Memuat data pesanan...</td></tr>';
    }
    
    try {
        const response = await fetch(API_PESANAN);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Gabungkan data API dan data statis (API akan diutamakan jika ID-nya sama, namun di sini ID statis unik (#100x))
            let fetchedOrders = result.data;

            // Pastikan data API memiliki id_pesanan (jika menggunakan id numerik)
            fetchedOrders = fetchedOrders.map(order => {
                if (!order.id_pesanan) order.id_pesanan = `#${order.id}`;
                return order;
            });
            
            allOrders = fetchedOrders; // Hanya gunakan data API
            allOrders.sort((a, b) => b.id - a.id);
            renderOrderTable(allOrders);

            // Jika Anda ingin menggabungkan data statis dan API (gunakan baris ini sebagai gantinya)
            // const combinedOrders = [...staticOrders, ...fetchedOrders];
            // combinedOrders.sort((a, b) => b.id - a.id); // Sorting harus berdasarkan waktu atau ID yang benar
            // allOrders = combinedOrders;
            // renderOrderTable(allOrders);

        } else {
            // Jika API gagal/kosong, fallback ke data statis (jika ada)
            if (staticOrders.length > 0) {
                allOrders = staticOrders;
                // Tidak perlu sorting karena sudah diurutkan di HTML
                renderOrderTable(allOrders);
            } else {
                allOrders = [];
                ordersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Belum ada data pesanan.</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error fetching orders, falling back to static data:', error);
        // Fallback ke data statis jika koneksi/fetch error
        if (staticOrders.length > 0) {
            allOrders = staticOrders;
            renderOrderTable(allOrders);
        } else {
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-center text-red-500">Gagal memuat data pesanan. Cek koneksi server.</td></tr>';
        }
    }
}


// Mendapatkan data order dari API atau dari atribut data-order (jika data statis)
function getOrderData(orderId) {
    // 1. Cek di array allOrders (dari API)
    let order = allOrders.find(o => String(o.id) === String(orderId) || String(o.id_pesanan) === String(orderId));
    
    if (order) return order;

    // 2. Cek di baris data HTML (data statis)
    const row = document.querySelector(`tr[data-id="${orderId}"]`);
    if (row && row.dataset.order) {
        try {
            order = JSON.parse(row.dataset.order);
            // Tambahkan data-id dan data-status yang ada di <tr>
            order.id = row.dataset.id; 
            order.status_pesanan = row.dataset.status; 
            return order;
        } catch (e) {
            console.error(`Gagal parse JSON pada data statis ${orderId}:`, e);
        }
    }
    return null;
}


async function showOrderDetail(orderId) {
    if (!detailModal) {
        console.error('Modal detail tidak ditemukan.');
        return;
    }

    const localOrStaticOrder = getOrderData(orderId);
    if (localOrStaticOrder) {
        openDetailModal(localOrStaticOrder);
        return;
    }

    // Jika tidak ada di lokal/statis, coba ambil dari API menggunakan ID numerik (asumsi orderId bisa berupa #100x atau hanya angka)
    const cleanId = String(orderId).replace('#', '');

    detailId.textContent = 'Memuat...';
    detailModal.classList.remove('hidden');

    try {
        const response = await fetch(`${API_PESANAN}/${cleanId}`); 
        if (!response.ok) {
            throw new Error(`Gagal mengambil data detail pesanan. Status: ${response.status}`);
        }
        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.message || 'Data detail pesanan tidak ditemukan.');
        }

        const order = result.data;
        if (!order.id_pesanan) order.id_pesanan = `#${order.id}`;
        openDetailModal(order); 

    } catch (error) {
        console.error('Error memuat detail pesanan:', error);
        alert(`Gagal memuat detail pesanan: ${error.message}`);
        detailModal.classList.add('hidden');
    }
}

async function updateOrderStatus(id, newStatus) {
    const orderRow = document.querySelector(`tr[data-id="${id}"]`);
    const currentStatus = orderRow ? orderRow.dataset.status : 'Menunggu Konfirmasi'; // Fallback
    const totalOrder = orderRow ? orderRow.dataset.total : 0;
    
    let confirmationMessage = `Yakin ingin mengubah status pesanan ${id} menjadi "${newStatus}"?`;

    if (newStatus === 'Dibatalkan' && (currentStatus === 'Dikonfirmasi' || currentStatus === 'Sedang Diproses' || currentStatus === 'Selesai')) {
        confirmationMessage += `\n\nPERINGATAN: Pesanan ini sudah dicatat sebagai pendapatan (${formatRupiah(Number(totalOrder))}). Perubahan status menjadi Dibatalkan HARUS membatalkan atau mengurangi jumlah ini dari Pendapatan Harian di server Anda. Lanjutkan?`;
    } else if (newStatus === 'Dikonfirmasi' || newStatus === 'Selesai') {
        confirmationMessage += `\n\nPesanan ini akan dicatat sebagai Pendapatan Harian (${formatRupiah(Number(totalOrder))}) dan Jumlah Pesanan Hari Ini. Lanjutkan?`;
    }


    if (!confirm(confirmationMessage)) {
        return;
    }

    // Logic yang diubah: 
    // 1. Menghapus pengecekan yang memblokir pembaruan status pesanan statis.
    // 2. Membersihkan ID (menghapus '#' di awal) sebelum dikirim ke API, 
    //    sehingga ID statis seperti '#24' akan dikirim sebagai '24'.
    const cleanId = String(id).replace('#', '');
    
    try {
        const response = await fetch(`${API_PESANAN}/${cleanId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_pesanan: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            alert(`Status pesanan ${id} berhasil diubah menjadi ${newStatus}.`);
            // Memuat ulang pesanan untuk memperbarui UI dan data.
            loadOrders(); 
            
            if (newStatus === 'Dikonfirmasi' || newStatus === 'Selesai') {
                console.log(`[SERVER-SIDE ACTION REQUIRED]: Status pesanan ${id} diubah menjadi ${newStatus}. Server HARUS mencatat pesanan ini ke metrik pendapatan harian.`);
            } else if (newStatus === 'Dibatalkan' && (currentStatus === 'Dikonfirmasi' || currentStatus === 'Sedang Diproses' || currentStatus === 'Selesai')) {
                console.log(`[SERVER-SIDE ACTION REQUIRED]: Status pesanan ${id} diubah menjadi Dibatalkan. Server HARUS mengurangi total pesanan ini dari metrik pendapatan harian.`);
            }

        } else {
            alert(`Gagal mengubah status pesanan: ${result.message}`);
        }
    } catch (error) {
        alert('Terjadi kesalahan koneksi saat memperbarui status.');
        console.error('Update status error:', error);
    }
}

function handleSearch(searchInput) {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        renderOrderTable(allOrders); 
        return;
    }

    const filteredOrders = allOrders.filter(order => {
        const id = String(order.id_pesanan || order.id).toLowerCase();
        const customerName = order.nama_pelanggan.toLowerCase();
        const status = order.status_pesanan.toLowerCase();

        return id.includes(searchTerm) ||
               customerName.includes(searchTerm) ||
               status.includes(searchTerm);
    });

    renderOrderTable(filteredOrders);
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    if (closeDetailModalBtn) {
        closeDetailModalBtn.addEventListener('click', () => detailModal.classList.add('hidden'));
    }

    if (ordersTableBody) {
        ordersTableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const id = target.dataset.id;
            const action = target.dataset.action; 
            
            if (action === 'detail') {
                showOrderDetail(id); 
            } else if (action === 'confirm') {
                updateOrderStatus(id, 'Dikonfirmasi');
            } else if (action === 'complete') {
                updateOrderStatus(id, 'Selesai');
            } else if (action === 'cancel') {
                updateOrderStatus(id, 'Dibatalkan');
            }
        });
    }

    const searchInput = document.getElementById('search-input'); 

    if (searchInput) {
        searchInput.addEventListener('input', () => handleSearch(searchInput));
    }

    const yearElement = document.getElementById('year-orders');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});