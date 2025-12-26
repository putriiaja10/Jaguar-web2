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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return date.toLocaleDateString('id-ID', options).replace(/\./g, '');
}

function cleanWhatsappNumber(number) {
    if (!number) return '';
    let cleaned = String(number).replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '62' + cleaned.substring(1);
    if (cleaned.startsWith('62')) return cleaned;
    if (cleaned.length >= 8) return '62' + cleaned;
    return cleaned;
}

function renderOrderTable(ordersData) {
    ordersTableBody.innerHTML = ordersData.map(order => {
        const currentStatus = order.status_pesanan || 'Menunggu Konfirmasi';
        const badgeClass = getStatusBadgeClass(currentStatus);
        const formattedTotal = formatRupiah(order.jumlah_total);
        const formattedTime = formatDateTime(order.waktu_pesanan);
        const orderId = order.id_pesanan || order.id;

        let actionButtons = `<button data-id="${orderId}" data-action="detail" class="text-indigo-600 hover:text-indigo-900 mr-3">Detail</button>`;

        if (currentStatus === 'Menunggu Konfirmasi') {
            actionButtons += `<button data-id="${orderId}" data-action="confirm" class="text-green-600 hover:text-green-900 mr-3">Konfirmasi</button>`;
            actionButtons += `<button data-id="${orderId}" data-action="cancel" class="text-red-600 hover:text-red-900">Batal</button>`;
        }

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
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">Tidak ada pesanan.</td></tr>';
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
    const waNumber = cleanWhatsappNumber(order.nomor_whatsapp);
    detailWaLink.href = `https://wa.me/${waNumber}`;

    let detailHTML = '<p class="text-gray-500">Tidak ada rincian menu.</p>';
    let detailPesananData = order.detail_pesanan;

    try {
        const details = typeof detailPesananData === 'string' ? JSON.parse(detailPesananData) : detailPesananData;
        if (Array.isArray(details) && details.length > 0) {
            detailHTML = details.map(item => `
                <p class="text-gray-700">
                    <span class="font-semibold">${item.menu || 'Menu Tidak Diketahui'}</span>:
                    ${item.qty} pcs @ ${formatRupiah(item.price)}
                    (<span class="font-medium">${formatRupiah(item.subtotal)}</span>)
                </p>
            `).join('');
        }
    } catch {
        if (typeof detailPesananData === 'string' && detailPesananData.trim()) {
            detailHTML = `<p class="text-sm text-gray-700 whitespace-pre-line">${detailPesananData.replace(/;/g, ';\n')}</p>`;
        }
    }

    detailItems.innerHTML = detailHTML;
    detailModal.classList.remove('hidden');
}

async function loadOrders() {
    try {
        const response = await fetch(API_PESANAN);
        const result = await response.json();
        if (result.success) {
            allOrders = result.data.map(o => {
                if (!o.id_pesanan) o.id_pesanan = `#${o.id}`;
                return o;
            }).sort((a, b) => b.id - a.id);
            renderOrderTable(allOrders);
        } else {
            renderOrderTable([]);
        }
    } catch {
        renderOrderTable([]);
    }
}

function getOrderData(orderId) {
    return allOrders.find(o => String(o.id_pesanan) === String(orderId) || String(o.id) === String(orderId)) || null;
}

async function showOrderDetail(orderId) {
    const order = getOrderData(orderId);
    if (order) {
        openDetailModal(order);
        return;
    }

    const cleanId = String(orderId).replace('#', '');
    try {
        const response = await fetch(`${API_PESANAN}/${cleanId}`);
        const result = await response.json();
        if (result.success) {
            openDetailModal(result.data);
        }
    } catch {}
}

async function updateOrderStatus(id, newStatus) {
    const orderRow = document.querySelector(`tr[data-id="${id}"]`);
    const currentStatus = orderRow ? orderRow.dataset.status : 'Menunggu Konfirmasi';
    const totalOrder = orderRow ? orderRow.dataset.total : 0;

    let message = `Yakin ubah status pesanan ${id} menjadi "${newStatus}"?`;
    if (newStatus === 'Selesai') {
        message += `\n\nPesanan dicatat sebagai pendapatan ${formatRupiah(Number(totalOrder))}.`;
    }
    if (newStatus === 'Dibatalkan' && currentStatus === 'Selesai') {
        message += `\n\nPesanan ini sudah tercatat sebagai pendapatan.`;
    }

    if (!confirm(message)) return;

    const cleanId = String(id).replace('#', '');

    try {
        const response = await fetch(`${API_PESANAN}/${cleanId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_pesanan: newStatus })
        });
        const result = await response.json();
        if (result.success) loadOrders();
    } catch {}
}

function handleSearch(input) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
        renderOrderTable(allOrders);
        return;
    }
    renderOrderTable(allOrders.filter(o =>
        String(o.id_pesanan).toLowerCase().includes(term) ||
        o.nama_pelanggan.toLowerCase().includes(term) ||
        o.status_pesanan.toLowerCase().includes(term)
    ));
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    closeDetailModalBtn?.addEventListener('click', () => detailModal.classList.add('hidden'));

    ordersTableBody.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'detail') showOrderDetail(id);
        if (action === 'confirm') updateOrderStatus(id, 'Selesai');
        if (action === 'cancel') updateOrderStatus(id, 'Dibatalkan');
    });

    const searchInput = document.getElementById('search-input');
    searchInput?.addEventListener('input', () => handleSearch(searchInput));

    const year = document.getElementById('year-orders');
    if (year) year.textContent = new Date().getFullYear();
});
