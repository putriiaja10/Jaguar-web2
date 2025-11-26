const API_BASE = 'http://localhost:3000/api';

const fiturBtn = document.getElementById('action-btn-fitur');
const fiturRow = document.getElementById('row-fitur');

const infoBtn = document.getElementById('edit-all-informasi-toko');
const tdAlamat = document.getElementById('td-alamat');
const tdJam = document.getElementById('td-jam');
const tdWa = document.getElementById('td-wa');
const tdGmaps = document.getElementById('td-gmaps');

function findTableBodyByHeader(headerText) {
    const tables = document.querySelectorAll('table.min-w-full');
    for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('thead th')).map(x => x.textContent.trim());
        if (headers.includes(headerText)) return table.querySelector('tbody');
    }
    return null;
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

async function loadKonten() {
    try {
        const res = await fetch(`${API_BASE}/konten`);
        const j = await res.json();
        if (j.success && j.data) {
            const d = j.data;
            const tds = fiturRow.querySelectorAll('td');
            const keunggulanHtml = (d.keunggulan || '').split('\n')
                .map(item => `<li>${escapeHtml(item.trim())}</li>`)
                .join('');
            if (tds.length >= 4) {
                tds[0].innerHTML = `<div class="max-w-lg">${escapeHtml(d.tentang_kami || '')}</div>`;
                tds[1].innerHTML = `<ul class="list-disc pl-5 space-y-1"><p>${escapeHtml(d.visi || '')}</p></ul>`;
                tds[2].innerHTML = `<ul class="list-disc pl-5 space-y-1">${keunggulanHtml}</ul>`;
                tds[3].innerHTML = `<ul class="list-disc pl-5 space-y-1"><p>${escapeHtml(d.slogan || '')}</p></ul>`;
            }
        }
    } catch (e) { }
}

async function saveKonten(tentang_kami, visi, keunggulan, slogan) {
    try {
        const res = await fetch(`${API_BASE}/konten`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tentang_kami, visi, keunggulan, slogan })
        });
        const j = await res.json();
        if (j.success) alert('Konten berhasil disimpan');
        else alert('Gagal menyimpan konten');
    } catch (e) { alert('Gagal menyimpan konten'); }
}

if (fiturBtn) {
    fiturBtn.addEventListener('click', async () => {
        const tds = Array.from(fiturRow.querySelectorAll('td')).slice(0, 4);
        if (fiturBtn.textContent.trim() === 'Edit tentang kami') {
            tds.forEach((td, index) => {
                td.setAttribute('contenteditable', 'true');
                if (index > 0) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = td.innerHTML;
                    const textContent = Array.from(tempDiv.querySelectorAll('li, p'))
                        .map(el => el.textContent.trim())
                        .filter(Boolean)
                        .join('\n');
                    td.innerText = textContent;
                }
            });
            fiturBtn.textContent = 'Simpan';
            fiturBtn.classList.remove('text-indigo-600');
            fiturBtn.classList.add('text-green-600');
        } else {
            tds.forEach(td => td.setAttribute('contenteditable', 'false'));
            const tentang = tds[0].innerText.trim();
            const visi = tds[1].innerText.trim();
            const keunggulan = tds[2].innerText.trim();
            const slogan = tds[3].innerText.trim();
            await saveKonten(tentang, visi, keunggulan, slogan);
            loadKonten();
            fiturBtn.textContent = 'Edit tentang kami';
            fiturBtn.classList.remove('text-green-600');
            fiturBtn.classList.add('text-indigo-600');
        }
    });
}

async function loadInformasiToko() {
    try {
        const res = await fetch(`${API_BASE}/informasi-toko`);
        const j = await res.json();
        if (j.success && j.data) {
            const d = j.data;
            tdAlamat.innerText = d.alamat_lengkap || '';
            tdJam.innerText = d.jam_operasional || '';
            tdWa.innerText = d.nomor_whatsapp || '';
            tdGmaps.innerText = d.lokasi_gmaps_link || '';
        }
    } catch (e) { }
}

async function saveInformasiToko(alamat_lengkap, jam_operasional, nomor_whatsapp, lokasi_gmaps_link) {
    const payload = { alamat_lengkap, jam_operasional, nomor_whatsapp, lokasi_gmaps_link };
    try {
        const res = await fetch(`${API_BASE}/informasi-toko`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (j.success) alert('Informasi toko berhasil disimpan');
        else alert('Gagal menyimpan informasi toko');
    } catch (e) { alert('Gagal menyimpan informasi toko'); }
}

if (infoBtn) {
    document.querySelectorAll('.edit-info-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    infoBtn.addEventListener('click', async () => {
        const infoCells = [tdAlamat, tdJam, tdWa, tdGmaps];
        if (infoBtn.textContent.trim().startsWith('Edit')) {
            infoCells.forEach(td => {
                td.setAttribute('contenteditable', 'true');
                td.classList.add('border', 'border-indigo-300', 'bg-indigo-50/50');
            });
            infoBtn.textContent = 'Simpan Semua Perubahan';
            infoBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            infoBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            infoCells.forEach(td => {
                td.setAttribute('contenteditable', 'false');
                td.classList.remove('border', 'border-indigo-300', 'bg-indigo-50/50');
            });

            const alamat_lengkap = tdAlamat.innerText.trim();
            const jam_operasional = tdJam.innerText.trim();
            const nomor_whatsapp = tdWa.innerText.trim();
            const lokasi_gmaps_link = tdGmaps.innerText.trim();

            if (!alamat_lengkap && !jam_operasional && !nomor_whatsapp && !lokasi_gmaps_link) {
                alert('Setidaknya satu kolom informasi toko harus diisi sebelum disimpan.');
                infoCells.forEach(td => {
                    td.setAttribute('contenteditable', 'true');
                    td.classList.add('border', 'border-indigo-300', 'bg-indigo-50/50');
                });
                return;
            }

            await saveInformasiToko(alamat_lengkap, jam_operasional, nomor_whatsapp, lokasi_gmaps_link);
            loadInformasiToko();

            infoBtn.textContent = 'Edit Semua Informasi Toko';
            infoBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            infoBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        }
    });
}

const addPhotoBtn = document.getElementById('add-photo-btn');
const galeriTbody = findTableBodyByHeader('Nama Gambar');
let galeriList = [];

async function loadGaleri() {
    try {
        if (!galeriTbody) return;
        const res = await fetch(`${API_BASE}/galeri`);
        const j = await res.json();
        if (j.success) {
            galeriList = j.data || [];
            renderGaleri();
        }
    } catch (e) { }
}

function renderGaleri() {
    if (!galeriTbody) return;
    galeriTbody.innerHTML = '';
    if (!galeriList || galeriList.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada foto</td>';
        galeriTbody.appendChild(tr);
        return;
    }
    galeriList.forEach(item => {
        const publicPath = item.path_file
            ? (item.path_file.startsWith('http') ? item.path_file : `http://localhost:3000/${item.path_file}`)
            : '#';
        const fileName = item.path_file ? item.path_file.split('/').pop() : 'Tidak ada file';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <tr id="row-galeri-${item.id_foto}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(item.nama_foto)}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-lg">
                    <a href="${publicPath}" target="_blank" class="text-indigo-600 hover:text-indigo-900 truncate block">
                        ${fileName}
                    </a>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-id="${item.id_foto}" class="text-red-600 hover:text-red-900 btn-delete-galeri">Hapus Foto</button>
                </td>
            </tr>`;
        galeriTbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete-galeri').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const namaFoto = galeriList.find(i => i.id_foto == id)?.nama_foto || 'Foto ini';
        if (!confirm(`Yakin ingin menghapus foto "${namaFoto}"?`)) return;
        deleteGaleri(id);
    }));
}

addPhotoBtn.addEventListener('click', () => {
    const fi = document.createElement('input');
    fi.type = 'file';
    fi.accept = 'image/*';
    fi.addEventListener('change', async () => {
        if (!fi.files || fi.files.length === 0) return;
        const file = fi.files[0];
        const nama = prompt('Masukkan Nama Gambar:');
        if (!nama || !nama.trim()) {
            alert('Nama gambar wajib diisi');
            return;
        }
        const fd = new FormData();
        fd.append('nama_foto', nama.trim());
        fd.append('foto_galeri', file);
        try {
            const res = await fetch(`${API_BASE}/galeri`, { method: 'POST', body: fd });
            const j = await res.json();
            if (j.success) {
                alert('Berhasil mengunggah foto');
                await loadGaleri();
            } else alert('Gagal mengunggah foto');
        } catch (e) { alert('Gagal mengunggah foto'); }
    });
    fi.click();
});

async function deleteGaleri(id) {
    try {
        const res = await fetch(`${API_BASE}/galeri/${id}`, { method: 'DELETE' });
        const j = await res.json();
        if (j.success) {
            alert('Foto berhasil dihapus');
            await loadGaleri();
        } else alert('Gagal menghapus foto');
    } catch (e) { alert('Gagal menghapus foto'); }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        loadKonten();
        loadInformasiToko();
        await loadGaleri();
    } catch (e) { }
    const yearEl = document.getElementById('year-content');
    if (yearEl) yearEl.innerText = new Date().getFullYear();
});