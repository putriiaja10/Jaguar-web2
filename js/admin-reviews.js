document.addEventListener('DOMContentLoaded', function() {
    const yearEl = document.getElementById('year-reviews');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const reviewsContainer = document.getElementById('reviews-container');
    const searchInput = document.querySelector('input[type="text"]');
    
    let allReviews = [];

    function formatDate(dateString) {
        if (!dateString) return "Tanggal Tidak Tersedia";
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Tanggal Tidak Valid";
        }
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
    }

    function createStars(rating) {
        if (!rating || rating < 0 || rating > 5) rating = 0;
        
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

    function showNotification(message, isSuccess = true) {
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
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    async function testServerConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server response: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Server connection test failed:', error);
            return false;
        }
    }

    function createReplyModal(reviewId, currentReply = '') {
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
                    <p class="text-sm text-gray-600 mt-1">ID Ulasan: ${reviewId}</p>
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
                            class="px-4 py-2 bg-[#706442] text-white rounded-lg hover:bg-[#5a4f3a] transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span id="submit-reply-text">${currentReply ? 'Update Balasan' : 'Kirim Balasan'}</span>
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

        document.getElementById('cancel-reply').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('submit-reply').addEventListener('click', () => {
            submitReply(reviewId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        setTimeout(() => {
            const textarea = document.getElementById('reply-textarea');
            if (textarea) textarea.focus();
        }, 100);
    }

    async function submitReply(reviewId) {
        const replyTextarea = document.getElementById('reply-textarea');
        const replyText = replyTextarea ? replyTextarea.value.trim() : '';
        const submitBtn = document.getElementById('submit-reply');
        const submitText = document.getElementById('submit-reply-text');
        const submitSpinner = document.getElementById('submit-reply-spinner');

        if (!replyText) {
            showNotification('Balasan tidak boleh kosong!', false);
            return;
        }

        const isServerConnected = await testServerConnection();
        if (!isServerConnected) {
            showNotification('Koneksi server gagal. Periksa koneksi internet dan pastikan server berjalan.', false);
            return;
        }

        submitBtn.disabled = true;
        submitText.textContent = 'Mengirim...';
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                alert('Balasan dikirim!');
                
                const modal = document.getElementById('reply-modal');
                if (modal) modal.remove();
                
                loadReviews();
            } else {
                throw new Error(result.message || 'Gagal mengirim balasan');
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            
            let errorMessage = 'Gagal mengirim balasan';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Koneksi server gagal. Pastikan server berjalan dan dapat diakses.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = 'Endpoint tidak ditemukan. Periksa konfigurasi server.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage = 'Terjadi kesalahan internal server. Periksa log server.';
            } else {
                errorMessage = `Gagal mengirim balasan: ${error.message}`;
            }
            
            showNotification(errorMessage, false);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitText.textContent = 'Kirim Balasan';
            }
            if (submitSpinner) {
                submitSpinner.classList.add('hidden');
            }
        }
    }

    async function deleteAdminReply(reviewId) {
        if (!confirm('Anda yakin ingin menghapus balasan admin ini?')) {
            return;
        }

        const isServerConnected = await testServerConnection();
        if (!isServerConnected) {
            showNotification('Koneksi server gagal. Periksa koneksi internet dan pastikan server berjalan.', false);
            return;
        }

        try {
            const response = await fetch(`/api/ulasan/${reviewId}/balasan`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    balasan_admin: ''
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                showNotification('Balasan admin berhasil dihapus!', true);
                loadReviews();
            } else {
                throw new Error(result.message || 'Gagal menghapus balasan admin');
            }
        } catch (error) {
            console.error('Error deleting admin reply:', error);
            
            let errorMessage = 'Gagal menghapus balasan admin';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Koneksi server gagal. Pastikan server berjalan dan dapat diakses.';
            } else {
                errorMessage = `Gagal menghapus balasan admin: ${error.message}`;
            }
            
            showNotification(errorMessage, false);
        }
    }

    function createReviewElement(review) {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'bg-white p-6 rounded-xl shadow-lg border border-gray-100';
        reviewDiv.dataset.reviewId = review.id_ulasan;

        const initial = review.nama_pengulas ? review.nama_pengulas.charAt(0).toUpperCase() : '?';
        const reviewDate = formatDate(review.tanggal_ulasan || review.waktu_ulasan);
        const stars = createStars(review.rating_bintang);

        let adminReplySection = '';
        let actionButtons = '';

        if (review.balasan_admin && review.balasan_admin.trim() !== '') {
            adminReplySection = `
                <div class="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-semibold text-blue-700">Balasan Admin:</p>
                    </div>
                    <p class="text-sm text-gray-700">${review.balasan_admin}</p>
                </div>
            `;
            
            actionButtons = `
                <div class="flex space-x-3">
                    <button class="edit-reply-btn text-sm font-semibold text-[#706442] hover:text-[#5a4f3a] transition" data-id="${review.id_ulasan}">
                        Edit Balasan
                    </button>
                    <button class="delete-reply-btn text-sm font-semibold text-red-600 hover:text-red-800 transition">
                        Hapus Balasan
                    </button>
                </div>
            `;
        } else {
            actionButtons = `
                <div class="flex space-x-3">
                    <button class="reply-btn text-sm font-semibold text-[#706442] hover:text-[#5a4f3a] transition" data-id="${review.id_ulasan}">
                        Balas Ulasan
                    </button>
                </div>
            `;
        }

        reviewDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-semibold">${initial}</span>
                    <div>
                        <p class="font-bold text-lg">${review.nama_pengulas || 'Tidak Ada Nama'}</p>
                        <p class="text-sm text-gray-500">${reviewDate}</p>
                    </div>
                </div>
                <div class="flex items-center">
                    ${stars}
                    <span class="ml-2 text-gray-700 font-semibold">${review.rating_bintang || 0}.0</span>
                </div>
            </div>
            <p class="text-gray-700 mb-4">${review.komentar || 'Tidak ada komentar'}</p>
            ${adminReplySection}
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                ${actionButtons}
                <span class="text-xs text-gray-500">ID: ${review.id_ulasan}</span>
            </div>
        `;

        const replyBtn = reviewDiv.querySelector('.reply-btn');
        const editReplyBtn = reviewDiv.querySelector('.edit-reply-btn');
        const deleteReplyBtn = reviewDiv.querySelector('.delete-reply-btn');

        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                createReplyModal(review.id_ulasan, '');
            });
        }

        if (editReplyBtn) {
            editReplyBtn.addEventListener('click', () => {
                createReplyModal(review.id_ulasan, review.balasan_admin || '');
            });
        }

        if (deleteReplyBtn) {
            deleteReplyBtn.addEventListener('click', () => {
                deleteAdminReply(review.id_ulasan);
            });
        }

        return reviewDiv;
    }

    function filterReviews(searchTerm) {
        if (!searchTerm.trim()) {
            displayReviews(allReviews);
            return;
        }

        const filteredReviews = allReviews.filter(review => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (review.nama_pengulas && review.nama_pengulas.toLowerCase().includes(searchLower)) ||
                (review.komentar && review.komentar.toLowerCase().includes(searchLower)) ||
                (review.rating_bintang && review.rating_bintang.toString().includes(searchTerm)) ||
                (review.balasan_admin && review.balasan_admin.toLowerCase().includes(searchLower))
            );
        });

        displayReviews(filteredReviews);
    }

    function displayReviews(reviews) {
        if (!reviewsContainer) return;

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="text-center py-10">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
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

    async function loadReviews() {
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = `
            <div class="text-center py-10">
                <div class="inline-flex items-center">
                    <svg class="w-5 h-5 animate-spin text-[#706442] mr-3" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-gray-500">Memuat ulasan...</p>
                </div>
            </div>
        `;

        try {
            const isServerConnected = await testServerConnection();
            if (!isServerConnected) {
                throw new Error('Tidak dapat terhubung ke server. Pastikan server berjalan.');
            }

            const response = await fetch('/api/ulasan/all');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                allReviews = result.data || [];
                displayReviews(allReviews);
                
                if (allReviews.length === 0) {
                    showNotification('Tidak ada ulasan yang tersedia.', true);
                }
            } else {
                throw new Error(result.message || 'Gagal memuat ulasan');
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsContainer.innerHTML = `
                <div class="text-center py-10">
                    <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p class="text-red-500 text-lg mb-2">Gagal memuat ulasan</p>
                    <p class="text-gray-600">${error.message}</p>
                    <button id="retry-load" class="mt-4 px-4 py-2 bg-[#706442] text-white rounded-lg hover:bg-[#5a4f3a] transition">
                        Coba Lagi
                    </button>
                </div>
            `;

            const retryBtn = document.getElementById('retry-load');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadReviews);
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterReviews(e.target.value);
        });
    }

    async function initialize() {
        console.log('Initializing reviews management...');
        
        const isConnected = await testServerConnection();
        if (!isConnected) {
            showNotification('Peringatan: Tidak dapat terhubung ke server. Beberapa fitur mungkin tidak berfungsi.', false);
        }
        
        await loadReviews();
        
        console.log('Reviews management initialized');
    }

    initialize();
});