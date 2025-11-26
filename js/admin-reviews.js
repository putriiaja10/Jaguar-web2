// admin-reviews.js
document.addEventListener('DOMContentLoaded', function() {
    const yearEl = document.getElementById('year-reviews');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const reviewsContainer = document.getElementById('reviews-container');
    const searchInput = document.querySelector('input[type="text"]');
    
    let allReviews = [];

    // Format tanggal
    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Tanggal Tidak Valid";
        }
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    // Buat elemen bintang rating
    function createStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<svg class="w-5 h-5 fill-current text-yellow-500" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.23l-7.416 3.974 1.48-8.279L.001 9.306l8.332-1.151L12 .587z"/></svg>';
            } else {
                stars += '<svg class="w-5 h-5 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.23l-7.416 3.974 1.48-8.279L.001 9.306l8.332-1.151L12 .587z"/></svg>';
            }
        }
        return stars;
    }

    // Show notification
    function showNotification(message, isSuccess = true) {
        // Remove existing notification
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `custom-notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-xl z-50 transition-all duration-300 ${
            isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Buat modal balasan
    function createReplyModal(reviewId, currentReply = '') {
        // Remove existing modal
        const existingModal = document.getElementById('reply-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'reply-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-xl font-bold text-gray-800">Balas Ulasan</h3>
                </div>
                <div class="p-6">
                    <textarea 
                        id="reply-textarea" 
                        placeholder="Tulis balasan Anda di sini..."
                        class="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#706442] focus:border-[#706442] resize-none"
                    >${currentReply}</textarea>
                    <div class="flex justify-end space-x-3 mt-4">
                        <button 
                            id="cancel-reply" 
                            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button 
                            id="submit-reply" 
                            class="px-4 py-2 bg-[#706442] text-white rounded-lg hover:bg-[#5a4f3a] transition flex items-center"
                        >
                            <span id="submit-reply-text">Simpan Balasan</span>
                            <span id="submit-reply-spinner" class="hidden ml-2">
                                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners untuk modal
        document.getElementById('cancel-reply').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('submit-reply').addEventListener('click', () => {
            submitReply(reviewId);
        });

        // Close modal ketika klik di luar
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Submit balasan ke server
    async function submitReply(reviewId) {
        const replyText = document.getElementById('reply-textarea').value.trim();
        const submitBtn = document.getElementById('submit-reply');
        const submitText = document.getElementById('submit-reply-text');
        const submitSpinner = document.getElementById('submit-reply-spinner');

        if (!replyText) {
            showNotification('Balasan tidak boleh kosong!', false);
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Menyimpan...';
        submitSpinner.classList.remove('hidden');

        try {
            const response = await fetch(`/api/ulasan/${reviewId}/balasan`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    balasan_admin: replyText
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Balasan berhasil disimpan!', true);
                document.getElementById('reply-modal').remove();
                loadReviews(); // Reload reviews untuk menampilkan balasan baru
            } else {
                throw new Error(result.message || 'Gagal menyimpan balasan');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            showNotification(`Gagal menyimpan balasan: ${error.message}`, false);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitText.textContent = 'Simpan Balasan';
            submitSpinner.classList.add('hidden');
        }
    }

    // Hapus ulasan
    async function deleteReview(reviewId) {
        if (!confirm('Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        try {
            const response = await fetch(`/api/ulasan/${reviewId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Ulasan berhasil dihapus!', true);
                loadReviews(); // Reload reviews
            } else {
                throw new Error(result.message || 'Gagal menghapus ulasan');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showNotification(`Gagal menghapus ulasan: ${error.message}`, false);
        }
    }

    // Buat elemen review untuk admin
    function createReviewElement(review) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'bg-white p-6 rounded-xl shadow-lg border border-gray-100';
        reviewDiv.dataset.reviewId = review.id_ulasan;

        const initial = review.nama_pengulas ? review.nama_pengulas.charAt(0).toUpperCase() : '?';
        const reviewDate = formatDate(review.tanggal_ulasan || review.waktu_ulasan);
        const stars = createStars(review.rating_bintang);

        // Tampilkan balasan admin jika ada
        let adminReplySection = '';
        if (review.balasan_admin && review.balasan_admin.trim() !== '') {
            adminReplySection = `
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-semibold text-blue-700">Balasan Admin:</p>
                        <button class="edit-reply-btn text-xs text-blue-600 hover:text-blue-800 font-medium" data-id="${review.id_ulasan}">Edit</button>
                    </div>
                    <p class="text-sm text-gray-700">${review.balasan_admin}</p>
                </div>
            `;
        }

        reviewDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-semibold">${initial}</span>
                    <div>
                        <p class="font-bold text-lg">${review.nama_pengulas}</p>
                        <p class="text-sm text-gray-500">${reviewDate}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    ${stars}
                    <span class="ml-2 text-gray-700 font-semibold">${review.rating_bintang}.0</span>
                </div>
            </div>
            <p class="text-gray-700 mb-4">${review.komentar}</p>
            ${adminReplySection}
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div class="flex space-x-3">
                    <button class="reply-btn text-sm font-semibold text-[#706442] hover:text-[#5a4f3a] transition" data-id="${review.id_ulasan}">
                        ${review.balasan_admin ? 'Edit Balasan' : 'Balas Ulasan'}
                    </button>
                    <button class="delete-btn text-sm font-semibold text-red-600 hover:text-red-800 transition">Hapus</button>
                </div>
                <span class="text-xs text-gray-500">ID: ${review.id_ulasan}</span>
            </div>
        `;

        // Add event listeners
        const replyBtn = reviewDiv.querySelector('.reply-btn');
        const deleteBtn = reviewDiv.querySelector('.delete-btn');
        const editReplyBtn = reviewDiv.querySelector('.edit-reply-btn');

        replyBtn.addEventListener('click', () => {
            const currentReply = review.balasan_admin || '';
            createReplyModal(review.id_ulasan, currentReply);
        });

        if (editReplyBtn) {
            editReplyBtn.addEventListener('click', () => {
                const currentReply = review.balasan_admin || '';
                createReplyModal(review.id_ulasan, currentReply);
            });
        }

        deleteBtn.addEventListener('click', () => {
            deleteReview(review.id_ulasan);
        });

        return reviewDiv;
    }

    // Filter reviews berdasarkan pencarian
    function filterReviews(searchTerm) {
        const filteredReviews = allReviews.filter(review => 
            review.nama_pengulas.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.komentar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.rating_bintang.toString().includes(searchTerm)
        );

        displayReviews(filteredReviews);
    }

    // Tampilkan reviews
    function displayReviews(reviews) {
        if (!reviewsContainer) return;

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-gray-500 text-lg">Tidak ada ulasan yang ditemukan</p>
                </div>
            `;
            return;
        }

        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const reviewElement = createReviewElement(review);
            reviewsContainer.appendChild(reviewElement);
        });
    }

    // Load reviews dari API
    async function loadReviews() {
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = `
            <div class="text-center py-10">
                <p class="text-gray-500">Memuat ulasan...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/ulasan/all');
            const result = await response.json();

            if (result.success) {
                allReviews = result.data;
                displayReviews(allReviews);
            } else {
                throw new Error(result.message || 'Gagal memuat ulasan');
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsContainer.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-red-500">Gagal memuat ulasan: ${error.message}</p>
                </div>
            `;
        }
    }

    // Event listener untuk pencarian
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterReviews(e.target.value);
        });
    }

    // Initialize
    loadReviews();
});