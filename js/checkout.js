document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

    const menuSelect = document.getElementById('menuItem');
    const preview = document.getElementById('menu-preview');
    const priceEl = document.getElementById('menu-price');
    const DEFAULT_QTY = 1;
    const addToCartBtn = document.getElementById('add-to-cart');
    const cartList = document.getElementById('cart-list');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotalEl = document.getElementById('cart-total');
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = submitBtn ? (submitBtn.querySelector('.submit-spinner') || submitBtn.querySelector('#submit-spinner') || document.getElementById('submit-spinner')) : document.getElementById('submit-spinner');
    const ADMIN = '6289692783848';

    if (!form) return;

    const cart = [];

    function findCartIndexByName(name) { return cart.findIndex(i => i.name === name); }
    function calculateCartTotal() { return cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0); }

    function formatCurrency(v) { return 'Rp ' + Number(v).toLocaleString('id-ID'); }

    function renderCart() {
        cartList.innerHTML = '';
        if (cart.length === 0) { 
            if(cartEmpty) cartEmpty.classList.remove('hidden'); 
            cartList.appendChild(cartEmpty); cartTotalEl.textContent = 'Rp 0'; return; 
        }
        
        if(cartEmpty) cartEmpty.classList.add('hidden'); 

        cart.forEach((it, idx) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-md shadow-sm transform transition hover:scale-[1.01]';
            itemEl.innerHTML = `
                <div class="flex items-start sm:items-center gap-3">
                    <img src="${it.image}" alt="${it.name}" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
                    <div>
                        <div class="text-sm font-medium">${it.name}</div>
                        <div class="text-xs text-gray-500">${formatCurrency(it.price)}</div>
                    </div>
                </div>
                <div class="mt-3 sm:mt-0 flex items-center gap-3">
                    <div class="inline-flex items-center rounded-md border border-gray-200 overflow-hidden">
                        <button data-idx="${idx}" class="cart-dec px-2 py-1 bg-white text-gray-700" aria-label="Kurangi ${it.name}">−</button>
                        <input data-idx-input="${idx}" value="${it.qty}" type="number" min="1" class="w-14 text-center border-l border-r border-transparent text-sm" aria-label="Jumlah ${it.name}" />
                        <button data-idx="${idx}" class="cart-inc px-2 py-1 bg-white text-gray-700" aria-label="Tambah ${it.name}">＋</button>
                    </div>
                    <div class="text-sm text-gray-700">${formatCurrency(Number(it.price) * Number(it.qty))}</div>
                    <button data-idx="${idx}" class="cart-remove text-sm text-red-500">Hapus</button>
                </div>
            `;
            cartList.appendChild(itemEl);
        });
        cartTotalEl.textContent = formatCurrency(calculateCartTotal());

        cartList.querySelectorAll('.cart-inc').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart[idx].qty = Number(cart[idx].qty) + 1; renderCart(); }));
        cartList.querySelectorAll('.cart-dec').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart[idx].qty = Math.max(1, Number(cart[idx].qty) - 1); renderCart(); }));
        cartList.querySelectorAll('input[data-idx-input]').forEach(inp => inp.addEventListener('change', () => { const idx = Number(inp.getAttribute('data-idx-input')); let v = Number(inp.value || 1); if (!Number.isFinite(v) || v < 1) v = 1; cart[idx].qty = v; renderCart(); }));
        cartList.querySelectorAll('.cart-remove').forEach(btn => btn.addEventListener('click', () => { const idx = Number(btn.getAttribute('data-idx')); cart.splice(idx,1); renderCart(); }));
        validateFormAndCart();
    }

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    function showToast(text){ if(!toast||!toastMsg) return; toastMsg.textContent=text; toast.classList.remove('hidden'); toast.classList.add('opacity-100'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(()=>{ toast.classList.add('opacity-0'); setTimeout(()=>toast.classList.add('hidden'),300); },1400); }

    function setSubmitState(enabled){
        if(!submitBtn) return;
        if(enabled){
            submitBtn.removeAttribute('disabled');
            submitBtn.setAttribute('aria-disabled','false');
            submitBtn.classList.remove('bg-gray-100','text-gray-400','cursor-not-allowed');
            submitBtn.classList.add('bg-[#706442]','text-white');
        } else {
            submitBtn.setAttribute('disabled','');
            submitBtn.setAttribute('aria-disabled','true');
            submitBtn.classList.remove('bg-[#706442]','text-white');
            submitBtn.classList.add('bg-gray-100','text-gray-400','cursor-not-allowed');
        }
    }

    function validateFormAndCart(){
        const fieldsValid = form.checkValidity();
        const phoneEl = document.getElementById('phone');
        const phoneHint = document.getElementById('phone-hint');
        const raw = phoneEl ? phoneEl.value.trim() : '';
        const digits = raw.replace(/[^0-9]/g, '');
        let minDigits = 9;
        if (raw.startsWith('+')) {
            minDigits = 7;
        }
        const phoneOk = digits.length >= minDigits;

        if (phoneHint) {
            if (!phoneOk && raw.length > 0) {
                phoneHint.textContent = `Nomor terlalu pendek untuk format ini (butuh minimal ${minDigits} digit).`;
                phoneHint.classList.remove('hidden');
            } else {
                phoneHint.textContent = '';
                phoneHint.classList.add('hidden');
            }
        }

        const ok = fieldsValid && phoneOk && cart.length>0;
        setSubmitState(ok);
        return ok;
    }

    function updatePreview(){ 
        if(!menuSelect) return; 
        const opt = menuSelect.selectedOptions[0]; 
        const img = opt?.dataset?.image || ''; 
        const price = opt?.dataset?.price || ''; 
        // FIX #1: Perbaikan path gambar default (jika menu tidak punya foto)
        if(img) preview.src = img; else preview.src = '../../images/product/buburAyam.png'; 
        if(price) priceEl.textContent = formatCurrency(price); else priceEl.textContent='—'; 

        if(addToCartBtn) {
            if (menuSelect.value) {
                addToCartBtn.removeAttribute('disabled');
                addToCartBtn.classList.remove('opacity-60');
            } else {
                addToCartBtn.setAttribute('disabled', '');
                addToCartBtn.classList.add('opacity-60');
            }
        }
    }
    
    async function fetchAndPopulateMenu() {
        if (!menuSelect) return;
        try {
            const response = await fetch('http://localhost:3000/api/menu'); 
            if (!response.ok) throw new Error('Gagal koneksi ke server API.');
            
            // FIX #2: Menyesuaikan dengan format response server.js: { success: true, data: [...] }
            const result = await response.json(); 

            // Cek format data dan keberhasilan
            if (!result.success || !Array.isArray(result.data)) {
                 throw new Error('Format data menu tidak valid atau server error: ' + (result.message || 'Data tidak ditemukan.'));
            }

            // Filter menu yang berstatus 'Tersedia' (hanya menu yang tersedia yang ditampilkan di checkout)
            const menuData = result.data.filter(item => item.status_menu === 'Tersedia');

            const defaultOption = menuSelect.querySelector('option[value=""]');
            menuSelect.innerHTML = '';
            if (defaultOption) {
                menuSelect.appendChild(defaultOption);
            }
            
            menuData.forEach(item => {
                const option = document.createElement('option');
                option.value = item.menu;
                // FIX #3: Menggunakan path relatif yang benar untuk gambar
                const imagePath = `../../images/menu/${item.foto}`; 
                option.dataset.image = imagePath;
                option.dataset.price = Number(item.harga).toFixed(0); 
                option.textContent = `${item.menu} — ${formatCurrency(item.harga)}`;
                menuSelect.appendChild(option);
            });
            
            updatePreview();
        } catch (error) {
            console.error('Error memuat menu:', error);
            // Tambahkan pesan error ke console untuk debugging
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = `[Gagal memuat menu: ${error.message}]`;
            menuSelect.appendChild(errorOption);
            updatePreview();
        }
    }

    fetchAndPopulateMenu(); 
    
    if(menuSelect) menuSelect.addEventListener('change', updatePreview);
    ['name','phone','address','notes'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', validateFormAndCart); });

    if(addToCartBtn) addToCartBtn.addEventListener('click', ()=>{
        const opt = menuSelect.selectedOptions[0]; const name = menuSelect.value; const price = Number(opt?.dataset?.price||0); 
        // FIX #4: Perbaikan path gambar default saat add to cart
        const image = opt?.dataset?.image||'../../images/product/buburAyam.png'; 
        const qty=DEFAULT_QTY; if(!name){ alert('Pilih menu terlebih dahulu.'); return; } const idx=findCartIndexByName(name);
        if(idx>=0) cart[idx].qty = Number(cart[idx].qty)+qty; else cart.push({ id: Date.now(), name, price, image, qty }); renderCart(); showToast(`${name} ×${qty} ditambahkan`);
    });

    updatePreview();
    renderCart();

    form.addEventListener('submit', async (e)=>{
        e.preventDefault(); 
        if(!validateFormAndCart()){ 
            form.reportValidity(); 
            return; 
        }

        const name = document.getElementById('name').value.trim(); 
        const phoneEl = document.getElementById('phone');
        const phone = phoneEl.value.trim(); 
        const address = document.getElementById('address').value.trim(); 
        const notes = document.getElementById('notes').value.trim(); 
        
        if(cart.length===0){ 
            alert('Keranjang kosong. Tambahkan setidaknya satu item sebelum mengirim pesanan.'); 
            return; 
        }
        
        if (!confirm('Apakah pesanan sudah sesuai dan Anda yakin ingin mengirimnya?')) {
            return; 
        }

        const total = calculateCartTotal();
        let detailPesananDb = '';
        
        cart.forEach(it=>{ 
            detailPesananDb += `${it.name} x${it.qty} (${formatCurrency(Number(it.price) * Number(it.qty))}); `;
        }); 
        
        let dbNotes = '';
        if(notes) {
            dbNotes = ` Catatan: ${notes}`;
        }
        
        const cleanPhoneNumber = phone.replace(/\D/g, ''); 

        const dataPesananApi = {
            nama_pelanggan: name,
            nomor_whatsapp: cleanPhoneNumber, 
            jumlah_total: total, 
            detail_pesanan: (detailPesananDb.trim() + dbNotes).trim(),
            // alamat_pemesan tidak dikirim ke API /api/pesanan di server.js, jadi ini dihapus/diabaikan
        };

        if (spinner) spinner.classList.remove('hidden'); 
        setSubmitState(false);

        try {
            const apiResponse = await fetch('http://localhost:3000/api/pesanan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataPesananApi),
            });

            const apiResult = await apiResponse.json();

            if (!apiResponse.ok || !apiResult.success) {
                throw new Error(apiResult.message || 'Gagal menyimpan pesanan ke server.');
            }

            // --- PERBAIKAN UTAMA: Ambil ID dari database response ---
            const dbOrderId = apiResult.id_pesanan; 
            if (!dbOrderId) {
                throw new Error('Server tidak mengembalikan ID Pesanan.');
            }

            let messageWa = `Pesanan dari Bubur Ayam Bang Jaka\n`; 
            messageWa += `Nama: ${name}\n`; 
            messageWa += `No HP: ${phone}\n`; 
            messageWa += `Alamat: ${address}\n`; 
            messageWa += `\nDaftar Pesanan:\n`; 
            
            cart.forEach(it=>{ 
                const itemDetail = `- ${it.name} x${it.qty} = ${formatCurrency(Number(it.price) * Number(it.qty))}\n`;
                messageWa += itemDetail;
            }); 
            
            messageWa += `\nTotal: ${formatCurrency(total)}\n`; 

            if(notes) {
                messageWa += `Catatan: ${notes}\n`; 
            }
            
            // Gunakan ID dari database
            messageWa = `*ID Pesanan: ${dbOrderId} (Telah dicatat di server)*\n\n` + messageWa; 

            const waUrl = `https://wa.me/${ADMIN}?text=${encodeURIComponent(messageWa)}`;
            window.open(waUrl,'_blank'); 
            
            showToast(`Pesanan #${dbOrderId} berhasil disimpan ke server!`);

        } catch (error) {
            console.error('Kesalahan koneksi/server:', error);
            alert(`Gagal mengirim pesanan. Silakan coba lagi atau hubungi admin. Error: ${error.message}`);
        } finally {
            if (spinner) spinner.classList.add('hidden'); 
            cart.length = 0;
            renderCart();
            form.reset(); 
            validateFormAndCart();
        }
    });

    validateFormAndCart();
});