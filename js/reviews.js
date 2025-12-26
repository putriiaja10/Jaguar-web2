document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const reviewsContainer = document.getElementById('reviews-container');
    const ulasanApiUrl = '/api/ulasan';
    const reviewForm = document.getElementById('review-form');
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('r-rating');
    const nameInput = document.getElementById('r-name');
    const messageInput = document.getElementById('r-message');
    const charCount = document.getElementById('char-count');
    const submitButton = document.getElementById('submit-review');
    const reviewStatus = document.getElementById('review-status');
    const formTitle = document.getElementById('form-title'); 

    const searchInput = document.getElementById('search-reviews'); 
    let allReviews = [];

    let isEditMode = false;
    let currentReviewId = localStorage.getItem('last_submitted_review_id');
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Tanggal Tidak Valid";
        }
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    function createStars(rating) {
        return '⭐'.repeat(rating);
    }

    function showToast(message, isSuccess = true) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-xl opacity-0 transition-opacity duration-300 pointer-events-none z-[100] ${
            isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        
        setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
        }, 3000);
    }

    function checkFormValidity() {
        if (!nameInput || !messageInput || !ratingInput || !submitButton) return;
        
        const nameValid = nameInput.value.trim() !== '';
        const messageValid = messageInput.value.trim().length >= 10;
        const ratingValid = parseInt(ratingInput.value) >= 1;
        const isValid = nameValid && messageValid && ratingValid;
        
        submitButton.disabled = !isValid;
        return isValid;
    }
    
    function setStarRating(rating) {
        ratingInput.value = rating;
        starButtons.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            if (starValue <= rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.add('text-gray-300');
                star.classList.remove('text-yellow-400');
            }
        });
        checkFormValidity();
    }

    function resetForm(title = 'Tinggalkan Ulasan Anda') {
        if (reviewForm) reviewForm.reset();
        setStarRating(5);
        isEditMode = false;
        if(formTitle) formTitle.textContent = title;
        if(submitButton) submitButton.textContent = 'Kirim Ulasan';
        
        if (messageInput && charCount) {
            charCount.textContent = `0 / 500`;
        }
        
        if (reviewStatus) {
            reviewStatus.textContent = '';
        }
        
        checkFormValidity();
    }

    function createReviewElement(review) {
        const article = document.createElement('article');
        article.className = 'bg-white rounded-xl shadow p-4 border border-gray-100';

        const initial = review.nama_pengulas ? review.nama_pengulas.charAt(0).toUpperCase() : '?';
        const reviewDate = formatDate(review.waktu_ulasan);
        const stars = createStars(review.rating_bintang);

        let balasanHtml = '';
        if (review.balasan_admin && review.balasan_admin.trim() !== '') {
            balasanHtml = `
                <div class="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-[#706442]">
                    <p class="text-xs font-semibold text-[#706442]">Balasan Admin:</p>
                    <p class="mt-1 text-sm text-gray-700">${review.balasan_admin}</p>
                </div>
            `;
        }
        
        let actionButtons = '';
        if (String(review.id_ulasan) === String(currentReviewId)) {
             actionButtons = `
                 <div class="flex gap-2 mt-2" id="action-buttons-${review.id_ulasan}">
                     <button data-id="${review.id_ulasan}" data-name="${review.nama_pengulas}" data-rating="${review.rating_bintang}" data-komentar="${review.komentar}" class="edit-btn text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                     <span class="text-xs text-gray-400">|</span>
                     <button data-id="${review.id_ulasan}" class="delete-btn text-xs text-red-600 hover:text-red-800 font-medium">Hapus</button>
                 </div>
             `;
        }

        article.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 flex-shrink-0 rounded-full bg-[#faf1e6] flex items-center justify-center text-[#706442] font-semibold text-lg">${initial}</div>
                <div class="flex-grow">
                    <h4 class="font-semibold">${review.nama_pengulas}</h4>
                    <div class="text-sm text-gray-500">${reviewDate} • ${stars}</div>
                    <p class="mt-2 text-gray-700">${review.komentar}</p>
                    ${balasanHtml}
                    ${actionButtons} 
                </div>
            </div>
        `;
        return article;
    }
    
    function attachReviewActionListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                handleEdit(
                    e.currentTarget.dataset.id, 
                    e.currentTarget.dataset.name,
                    e.currentTarget.dataset.rating,
                    e.currentTarget.dataset.komentar
                );
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = e.currentTarget.dataset.id;
                handleDelete(idToDelete);
            });
        });
    }

    function renderReviews(reviewsToRender) {
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = ''; 

        if (reviewsToRender.length > 0) {
            reviewsToRender.forEach(review => {
                const reviewElement = createReviewElement(review);
                reviewsContainer.appendChild(reviewElement);
            });
            
            attachReviewActionListeners();
        } else {
            reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-10">Tidak ada ulasan yang cocok dengan kata kunci Anda.</p>';
        }
    }
    
    function filterReviews() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            renderReviews(allReviews);
            return;
        }

        const filtered = allReviews.filter(review => {
            return review.nama_pengulas.toLowerCase().includes(searchTerm) ||
                   review.komentar.toLowerCase().includes(searchTerm);
        });

        renderReviews(filtered);
    }

    async function handleDelete(id) {
        if (confirm('Anda yakin ingin menghapus ulasan ini? Aksi ini tidak dapat dibatalkan.')) {
            try {
                const response = await fetch(`${ulasanApiUrl}/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    if (String(id) === String(currentReviewId)) {
                         localStorage.removeItem('last_submitted_review_id');
                         currentReviewId = null;
                    }
                    
                    showToast(result.message || 'Ulasan berhasil dihapus!', true);
                    loadReviews();
                    resetForm();
                    document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    const error = await response.json();
                    showToast(`Gagal menghapus ulasan: ${error.message}`, false);
                }
            } catch (error) {
                showToast('Terjadi kesalahan jaringan saat menghapus ulasan.', false);
            }
        }
    }

    function handleEdit(id, name, rating, komentar) {
        document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth' });
        
        isEditMode = true;
        currentReviewId = id;
        if(formTitle) formTitle.textContent = `Edit Ulasan Anda`;
        
        nameInput.value = name;
        messageInput.value = komentar;
        setStarRating(parseInt(rating));
        
        submitButton.textContent = 'Simpan Perubahan';
        
        if (reviewStatus) {
            reviewStatus.textContent = '';
        }
    }

    async function loadReviews() {
        if (!reviewsContainer) return;
        reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-10">Memuat ulasan...</p>';
        try {
            const response = await fetch(ulasanApiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                allReviews = data.data.sort((a, b) => new Date(b.waktu_ulasan) - new Date(a.waktu_ulasan));
                
                filterReviews();

            } else {
                reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-10">Belum ada ulasan yang tersedia.</p>';
                allReviews = [];
            }
        } catch (error) {
            console.error('Gagal memuat ulasan:', error);
            reviewsContainer.innerHTML = '<p class="text-red-500 text-center py-10">Gagal memuat ulasan. Cek server API Anda.</p>';
            allReviews = [];
        }
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterReviews);
    }
    
    if (starButtons.length > 0) {
        setStarRating(5);
        starButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const rating = parseInt(e.currentTarget.dataset.value);
                setStarRating(rating);
            });
        });
    }

    if (messageInput && charCount && nameInput) {
        const updateCharCount = () => {
            const length = messageInput.value.length;
            charCount.textContent = `${length} / 500`;
            checkFormValidity();
        };

        messageInput.addEventListener('input', updateCharCount);
        nameInput.addEventListener('input', checkFormValidity);
        
        updateCharCount();
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if(!checkFormValidity()) {
                showToast('Harap isi semua field dengan benar.', false);
                return;
            }

            if (reviewStatus) {
                reviewStatus.textContent = '';
            }
            
            const submitSpinner = document.getElementById('submit-spinner');
            const submitLabel = document.getElementById('submit-label');
            
            if (submitSpinner) submitSpinner.classList.remove('hidden');
            if (submitLabel) submitLabel.textContent = isEditMode ? 'Menyimpan...' : 'Mengirim...';
            submitButton.disabled = true;

            const ulasanData = {
                nama_pengulas: nameInput.value.trim(),
                rating_bintang: parseInt(ratingInput.value),
                komentar: messageInput.value.trim(),
            };

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `${ulasanApiUrl}/${currentReviewId}` : ulasanApiUrl;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ulasanData),
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    if (!isEditMode) {
                        currentReviewId = result.id_ulasan;
                        localStorage.setItem('last_submitted_review_id', currentReviewId);
                    }

                    showToast(result.message || 'Ulasan berhasil diproses!', true);
                    resetForm();
                    loadReviews();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || `Gagal memproses ulasan. Status: ${response.status}`);
                }
            } catch (error) {
                console.error('Error saat memproses ulasan:', error);
                showToast(`Gagal memproses ulasan: ${error.message}`, false);
            } finally {
                if (submitSpinner) submitSpinner.classList.add('hidden');
                if (submitLabel) submitLabel.textContent = isEditMode ? 'Simpan Perubahan' : 'Kirim Ulasan';
                submitButton.disabled = false;
            }
        });
    }
    
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    const formSection = document.getElementById('review-form-section');

    if (scrollToBottomBtn && formSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                scrollToBottomBtn.classList.remove('hidden');
            } else {
                scrollToBottomBtn.classList.add('hidden');
            }
        });

        scrollToBottomBtn.addEventListener('click', () => {
            formSection.scrollIntoView({ behavior: 'smooth' });
        });
        
        scrollToBottomBtn.classList.add('hidden');
    }

    loadReviews();
});