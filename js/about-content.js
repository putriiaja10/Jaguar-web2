const API_BASE_URL = 'http://localhost:3000/api'; 
const stringToUl = (text) => {
    if (!text) return '';
    const items = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (items.length === 0) return '';
    
    let ulHtml = '';
    items.forEach(item => {
        const safeItem = item.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        ulHtml += `<li>${safeItem}</li>`;
    });
    return ulHtml;
};

const loadContent = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/konten`);
        if (!response.ok) throw new Error('Gagal mengambil data konten.');
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            
            document.getElementById('content-tentang-kami').textContent = data.tentang_kami || '';
            document.getElementById('content-visi').textContent = data.visi || '';
            document.getElementById('content-slogan').textContent = data.slogan || '';
            document.getElementById('content-keunggulan').innerHTML = stringToUl(data.keunggulan || '');
        } else {
            console.warn('Data konten kosong atau tidak ditemukan:', result.message);
        }

    } catch (error) {
        console.error('Error memuat konten:', error);
    }
};

document.addEventListener('DOMContentLoaded', loadContent);