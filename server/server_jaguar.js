const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_NAME = 'db_jaguar';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: DATABASE_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log(' Database pool berhasil dibuat');
} catch (error) {
    console.error(' Gagal membuat database pool:', error.message);
    process.exit(1);
}

async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(' Koneksi database berhasil');
        connection.release();
    } catch (error) {
        console.error(' Koneksi database gagal:', error.message);
    }
}
testDatabaseConnection();

const MENU_UPLOAD_DIR = path.join(__dirname, '../images/menu/');
if (!fs.existsSync(MENU_UPLOAD_DIR)) {
    fs.mkdirSync(MENU_UPLOAD_DIR, { recursive: true });
}
const menuStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, MENU_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + ext);
    }
});
const uploadMenu = multer({
    storage: menuStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPEG/PNG) yang diizinkan!'), false);
        }
    }
});

const GALERI_UPLOAD_DIR = path.join(__dirname, '../images/galeri/');
if (!fs.existsSync(GALERI_UPLOAD_DIR)) {
    fs.mkdirSync(GALERI_UPLOAD_DIR, { recursive: true });
}
const galeriStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, GALERI_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp-galeri-' + uniqueSuffix + ext);
    }
});
const uploadGaleri = multer({
    storage: galeriStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPEG/PNG) yang diizinkan!'), false);
        }
    }
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '../html/tampilan')));
app.use(express.static(path.join(__dirname, '../html/admin')));
app.use(express.static(path.join(__dirname, '../html')));
app.use('/images', express.static(path.join(__dirname, '../images')));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/api/konten', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT tentang_kami, visi, keunggulan, slogan FROM konten LIMIT 1');

        if (results.length > 0) {
            res.status(200).json({ success: true, message: 'Data konten berhasil diambil.', data: results[0] });
        } else {
            res.status(200).json({ success: true, message: 'Data konten kosong.', data: {} });
        }
    } catch (error) {
        console.error('Error mengambil konten:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data konten.', error: error.message });
    }
});

app.put('/api/konten', async (req, res) => {
    const { tentang_kami, visi, keunggulan, slogan } = req.body;

    try {
        const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM konten');
        if (rows[0].cnt === 0) {
            await pool.query('INSERT INTO konten (tentang_kami, visi, keunggulan, slogan) VALUES (?, ?, ?, ?)', [tentang_kami, visi, keunggulan, slogan]);
        } else {
            await pool.query('UPDATE konten SET tentang_kami = ?, visi = ?, keunggulan = ?, slogan = ?', [tentang_kami, visi, keunggulan, slogan]);
        }
        res.status(200).json({ success: true, message: 'Data konten berhasil diperbarui.' });
    } catch (error) {
        console.error('Error update konten:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui data konten.', error: error.message });
    }
});

app.get('/api/informasi-toko', async (req, res) => {
    try {
        const [results] = await pool.query(
            'SELECT alamat_lengkap, jam_buka, jam_tutup, nomor_whatsapp, lokasi_gmaps_link FROM informasi_toko LIMIT 1'
        );

        if (results.length > 0) {
            const data = results[0];

            res.status(200).json({
                success: true,
                data: {
                    alamat_lengkap: data.alamat_lengkap,
                    jam_buka: data.jam_buka,
                    jam_tutup: data.jam_tutup,
                    nomor_whatsapp: data.nomor_whatsapp,
                    lokasi_gmaps_link: data.lokasi_gmaps_link
                }
            });


            res.status(200).json({
                success: true,
                data: {
                    alamat_lengkap: data.alamat_lengkap,
                    jam_buka: formatTime(data.jam_buka),
                    jam_tutup: formatTime(data.jam_tutup),
                    nomor_whatsapp: data.nomor_whatsapp,
                    lokasi_gmaps_link: data.lokasi_gmaps_link
                }
            });
        } else {
            res.status(200).json({ success: true, data: {} });
        }
    } catch (error) {
        console.error('Error mengambil info toko:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/informasi-toko', async (req, res) => {
    const { alamat_lengkap, jam_buka, jam_tutup, nomor_whatsapp, lokasi_gmaps_link } = req.body;

    try {
        const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM informasi_toko');

        if (rows[0].cnt === 0) {
            await pool.query(
                'INSERT INTO informasi_toko (alamat_lengkap, jam_buka, jam_tutup, nomor_whatsapp, lokasi_gmaps_link) VALUES (?, ?, ?, ?, ?)',
                [alamat_lengkap, jam_buka, jam_tutup, nomor_whatsapp, lokasi_gmaps_link]
            );
        } else {
            await pool.query(
                'UPDATE informasi_toko SET alamat_lengkap=?, jam_buka=?, jam_tutup=?, nomor_whatsapp=?, lokasi_gmaps_link=?',
                [alamat_lengkap, jam_buka, jam_tutup, nomor_whatsapp, lokasi_gmaps_link]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Informasi toko berhasil diperbarui.'
        });
    } catch (error) {
        console.error('Error update info toko:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui informasi toko.',
            error: error.message
        });
    }
});

app.get('/api/menu', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT id_menu, menu, harga, status_menu, foto, keterangan_menu, kategori_menu FROM menu ORDER BY kategori_menu ASC, menu ASC');
        res.status(200).json({ success: true, message: 'Data menu berhasil diambil.', data: results });
    } catch (error) {
        console.error('Error mengambil menu:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data menu.', error: error.message });
    }
});

app.get('/api/menu/latest', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT id_menu, menu, harga, status_menu, foto, keterangan_menu FROM menu WHERE status_menu = 'Tersedia' ORDER BY kategori_menu ASC, id_menu DESC LIMIT 4");
        res.status(200).json({ success: true, message: 'Data menu terbaru berhasil diambil.', data: results });
    } catch (error) {
        console.error('Error mengambil menu terbaru:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data menu terbaru.', error: error.message });
    }
});

app.post('/api/menu', uploadMenu.single('foto_menu'), async (req, res) => {
    const { menu, harga, keterangan_menu, status_menu, kategori_menu } = req.body;
    const foto = req.file ? req.file.filename : null;

    if (!menu || !harga) {
        if (foto && fs.existsSync(path.join(MENU_UPLOAD_DIR, foto))) fs.unlinkSync(path.join(MENU_UPLOAD_DIR, foto));
        return res.status(400).json({ success: false, message: 'Nama menu dan harga wajib diisi.' });
    }

    try {
        const final_status = status_menu || 'Tersedia';
        const final_kategori = kategori_menu || 'Tambahan';
        const query = 'INSERT INTO menu (menu, harga, keterangan_menu, foto, status_menu, kategori_menu) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [menu, harga, keterangan_menu, foto, final_status, final_kategori]);
        res.status(201).json({ success: true, message: 'Menu baru berhasil ditambahkan.', id_menu: result.insertId });
    } catch (error) {
        console.error('Error tambah menu:', error);
        if (foto && fs.existsSync(path.join(MENU_UPLOAD_DIR, foto))) fs.unlinkSync(path.join(MENU_UPLOAD_DIR, foto));
        res.status(500).json({ success: false, message: 'Gagal menambahkan menu.', error: error.message });
    }
});

app.put('/api/menu/:id', uploadMenu.single('foto_menu'), async (req, res) => {
    const id_menu = req.params.id;
    const { menu, harga, status_menu, keterangan_menu, kategori_menu, hapus_foto_lama } = req.body;
    const new_foto = req.file ? req.file.filename : null;

    try {
        const [rows] = await pool.query('SELECT foto FROM menu WHERE id_menu = ?', [id_menu]);
        const foto_lama = rows.length > 0 ? rows[0].foto : null;
        let foto_to_save = foto_lama;

        if (new_foto) {
            if (foto_lama) {
                const filePathOld = path.join(MENU_UPLOAD_DIR, foto_lama);
                if (fs.existsSync(filePathOld)) fs.unlinkSync(filePathOld);
            }
            foto_to_save = new_foto;
        } else if (hapus_foto_lama === 'true' && foto_lama) {
            const filePathOld = path.join(MENU_UPLOAD_DIR, foto_lama);
            if (fs.existsSync(filePathOld)) fs.unlinkSync(filePathOld);
            foto_to_save = null;
        }

        const query = 'UPDATE menu SET menu = ?, harga = ?, status_menu = ?, keterangan_menu = ?, kategori_menu = ?, foto = ? WHERE id_menu = ?';
        const [result] = await pool.query(query, [menu, harga, status_menu, keterangan_menu, kategori_menu, foto_to_save, id_menu]);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Menu berhasil diperbarui.' });
        } else {
            res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error update menu:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui menu.', error: error.message });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await pool.query('SELECT foto FROM menu WHERE id_menu = ?', [id]);
        const foto_lama = rows.length > 0 ? rows[0].foto : null;

        const [result] = await pool.query('DELETE FROM menu WHERE id_menu = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
        }

        if (foto_lama) {
            const filePath = path.join(MENU_UPLOAD_DIR, foto_lama);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.status(200).json({ success: true, message: 'Menu berhasil dihapus.' });
    } catch (error) {
        console.error('Error hapus menu:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus menu.', error: error.message });
    }
});

app.get('/api/galeri', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT id_foto, nama_foto, path_file, tanggal_upload FROM galeri_foto ORDER BY tanggal_upload DESC');
        res.status(200).json({ success: true, message: 'Data galeri berhasil diambil.', data: results });
    } catch (error) {
        console.error('Error mengambil galeri:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data galeri.', error: error.message });
    }
});

app.get('/api/galeri/latest', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT id_foto, nama_foto, path_file FROM galeri_foto ORDER BY tanggal_upload DESC LIMIT 4');
        res.status(200).json({ success: true, message: 'Data galeri terbaru berhasil diambil.', data: results });
    } catch (error) {
        console.error('Error mengambil galeri terbaru:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data galeri terbaru.', error: error.message });
    }
});

app.post('/api/galeri', uploadGaleri.single('foto_galeri'), async (req, res) => {
    const { nama_foto } = req.body;

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'File foto wajib diunggah.' });
    }

    const tempFilePath = req.file.path;
    const ext = path.extname(req.file.originalname);
    let newFileName = '';

    try {
        const [result] = await pool.query('INSERT INTO galeri_foto (nama_foto, path_file) VALUES (?, ?)', [nama_foto, 'TEMPORARY_PATH']);
        const id_foto = result.insertId;

        newFileName = `galeri-${id_foto}${ext}`;
        const finalFilePath = path.join(GALERI_UPLOAD_DIR, newFileName);
        const dbPath = `images/galeri/${newFileName}`;

        fs.renameSync(tempFilePath, finalFilePath);

        await pool.query('UPDATE galeri_foto SET path_file = ? WHERE id_foto = ?', [dbPath, id_foto]);

        res.status(201).json({ success: true, message: 'Foto galeri berhasil diunggah.' });
    } catch (error) {
        console.error('Error upload galeri:', error);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (newFileName && fs.existsSync(path.join(GALERI_UPLOAD_DIR, newFileName))) {
            fs.unlinkSync(path.join(GALERI_UPLOAD_DIR, newFileName));
        }

        res.status(500).json({ success: false, message: 'Gagal mengunggah foto galeri.', error: error.message });
    }
});

app.delete('/api/galeri/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await pool.query('SELECT path_file FROM galeri_foto WHERE id_foto = ?', [id]);

        const [result] = await pool.query('DELETE FROM galeri_foto WHERE id_foto = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Foto galeri tidak ditemukan.' });
        }

        if (rows.length > 0 && rows[0].path_file) {
            const filePath = path.join(__dirname, '..', rows[0].path_file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(200).json({ success: true, message: 'Foto galeri berhasil dihapus.' });
    } catch (error) {
        console.error('Error hapus galeri:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus foto galeri.', error: error.message });
    }
});

app.post('/api/pesanan', async (req, res) => {
    const { nama_pelanggan, nomor_whatsapp, jumlah_total, detail_pesanan } = req.body;

    if (!nama_pelanggan || !nomor_whatsapp || !jumlah_total || !detail_pesanan) {
        return res.status(400).json({ success: false, message: 'Nama, WhatsApp, Jumlah Total, dan Rincian Pesanan wajib diisi.' });
    }

    let finalDetailPesanan = detail_pesanan;
    if (typeof detail_pesanan !== 'string') {
        try {
            finalDetailPesanan = JSON.stringify(detail_pesanan);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Format detail_pesanan tidak valid (harus berupa objek/array yang bisa di-stringified).' });
        }
    }

    try {
        const query = `
            INSERT INTO pesanan 
            (tanggal_pesanan, waktu_pesanan, nama_pelanggan, nomor_whatsapp, jumlah_total, detail_pesanan, status_pesanan) 
            VALUES 
            (CURDATE(), NOW(), ?, ?, ?, ?, 'Menunggu Konfirmasi')
        `;
        const [result] = await pool.query(query, [nama_pelanggan, nomor_whatsapp, jumlah_total, finalDetailPesanan]);

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat. Menunggu konfirmasi admin.',
            id_pesanan: result.insertId
        });

    } catch (error) {
        console.error('Error membuat pesanan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat pesanan baru.',
            error: error.message
        });
    }
});

app.get('/api/pesanan/dashboard', async (req, res) => {
    try {
        const metricsQuery = `
            SELECT 
                COALESCE(SUM(jumlah_total), 0) AS total_pendapatan,
                COUNT(id) AS jumlah_pesanan 
            FROM pesanan
            WHERE DATE(tanggal_pesanan) = CURDATE()
            AND status_pesanan = 'Selesai';

        `;
        const [metricsResult] = await pool.query(metricsQuery);
        const todayMetrics = metricsResult.length > 0 ? metricsResult[0] : { total_pendapatan: 0, jumlah_pesanan: 0 };

        const ordersQuery = `
            SELECT 
                id, 
                nama_pelanggan, 
                jumlah_total, 
                waktu_pesanan
            FROM pesanan
            ORDER BY waktu_pesanan DESC
            LIMIT 10;
        `;
        const [ordersResult] = await pool.query(ordersQuery);

        res.status(200).json({
            success: true,
            message: 'Data dashboard berhasil diambil.',
            data: {
                todayMetrics: todayMetrics,
                orders: ordersResult
            }
        });

    } catch (error) {
        console.error('Error mengambil dashboard pesanan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dashboard pesanan.',
            error: error.message
        });
    }
});

app.get('/api/pesanan', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT id, tanggal_pesanan, waktu_pesanan, nama_pelanggan, nomor_whatsapp, jumlah_total, detail_pesanan, status_pesanan FROM pesanan ORDER BY waktu_pesanan DESC');

        const ordersParsed = orders.map(order => ({
            ...order,
            detail_pesanan: (() => {
                try {
                    return JSON.parse(order.detail_pesanan);
                } catch {
                    return order.detail_pesanan;
                }
            })()
        }));

        res.status(200).json({ success: true, message: 'Data pesanan berhasil diambil.', data: ordersParsed });
    } catch (error) {
        console.error('Error mengambil pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan.', error: error.message });
    }
});

app.get('/api/pesanan/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const query = 'SELECT * FROM pesanan WHERE id = ?';
        const [results] = await pool.query(query, [id]);

        if (results.length > 0) {
            const order = results[0];
            try {
                order.detail_pesanan = JSON.parse(order.detail_pesanan);
            } catch (e) {
            }
            res.status(200).json({ success: true, message: 'Detail pesanan berhasil diambil.', data: order });
        } else {
            res.status(404).json({ success: false, message: 'Gagal memuat detail pesanan: Pesanan tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error mengambil detail pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan.', error: error.message });
    }
});

app.put('/api/pesanan/:id/status', async (req, res) => {
    const id_pesanan = req.params.id;
    const { status_pesanan } = req.body;

    if (!status_pesanan) {
        return res.status(400).json({ success: false, message: 'Status pesanan tidak boleh kosong.' });
    }

    try {
        const [result] = await pool.query('UPDATE pesanan SET status_pesanan = ? WHERE id = ?', [status_pesanan, id_pesanan]);
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Status pesanan berhasil diperbarui.' });
        } else {
            res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan atau status sudah sama.' });
        }
    } catch (error) {
        console.error('Error update status pesanan:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status pesanan.', error: error.message });
    }
});

app.post('/api/ulasan', async (req, res) => {
    const { nama_pengulas, rating_bintang, komentar } = req.body;

    if (!nama_pengulas || !rating_bintang || !komentar) {
        return res.status(400).json({ success: false, message: 'Nama, rating, dan komentar wajib diisi.' });
    }

    try {
        const query = `
            INSERT INTO ulasan (tanggal_ulasan, waktu_ulasan, nama_pengulas, rating_bintang, komentar)
            VALUES (CURDATE(), NOW(), ?, ?, ?)
        `;
        const [result] = await pool.query(query, [nama_pengulas, rating_bintang, komentar]);

        res.status(201).json({
            success: true,
            message: 'Ulasan berhasil dikirim!',
            id_ulasan: result.insertId
        });
    } catch (error) {
        console.error('Error menyimpan ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan ulasan.',
            error: error.message
        });
    }
});

app.get('/api/ulasan', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            'SELECT id_ulasan, nama_pengulas, rating_bintang, komentar, tanggal_ulasan, waktu_ulasan, balasan_admin FROM ulasan ORDER BY waktu_ulasan DESC LIMIT 5'
        );

        const summaryQuery = `
            SELECT 
                COUNT(id_ulasan) AS total_ulasan,
                AVG(rating_bintang) AS rata_rata_rating
            FROM ulasan;
        `;
        const [summaryResults] = await pool.query(summaryQuery);
        const summary = summaryResults[0];

        res.status(200).json({
            success: true,
            message: 'Ulasan berhasil diambil.',
            data: reviews,
            stats: {
                total_ulasan: parseInt(summary.total_ulasan) || 0,
                rating_rata_rata: parseFloat(summary.rata_rata_rating).toFixed(1) || '0.0'
            }
        });
    } catch (error) {
        console.error('Error mengambil ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ulasan.',
            error: error.message
        });
    }
});

app.get('/api/ulasan/summary', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(id_ulasan) AS total_ulasan,
                AVG(rating_bintang) AS rata_rata_rating
            FROM ulasan;
        `;
        const [results] = await pool.query(query);

        if (results.length > 0) {
            const data = {
                total_ulasan: parseInt(results[0].total_ulasan) || 0,
                rata_rata_rating: parseFloat(results[0].rata_rata_rating).toFixed(1) || '0.0'
            };
            res.status(200).json({
                success: true,
                message: 'Ringkasan ulasan berhasil diambil.',
                data: data
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Belum ada ulasan.',
                data: { total_ulasan: 0, rata_rata_rating: '0.0' }
            });
        }
    } catch (error) {
        console.error('Error mengambil ringkasan ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ringkasan ulasan.',
            error: error.message
        });
    }
});

app.get('/api/ulasan/all', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            'SELECT * FROM ulasan ORDER BY waktu_ulasan DESC'
        );

        res.status(200).json({
            success: true,
            message: 'Semua ulasan berhasil diambil.',
            data: reviews
        });
    } catch (error) {
        console.error('Error mengambil semua ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ulasan.',
            error: error.message
        });
    }
});

app.put('/api/ulasan/:id/balasan', async (req, res) => {
    const id_ulasan = req.params.id;
    const { balasan_admin } = req.body;

    if (!id_ulasan || isNaN(id_ulasan)) {
        return res.status(400).json({
            success: false,
            message: 'ID ulasan tidak valid.'
        });
    }

    if (balasan_admin === undefined || balasan_admin === null) {
        return res.status(400).json({
            success: false,
            message: 'Balasan admin wajib diisi.'
        });
    }

    try {
        const [checkResult] = await pool.query(
            'SELECT id_ulasan FROM ulasan WHERE id_ulasan = ?',
            [id_ulasan]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ulasan tidak ditemukan.'
            });
        }

        const [result] = await pool.query(
            'UPDATE ulasan SET balasan_admin = ? WHERE id_ulasan = ?',
            [balasan_admin, id_ulasan]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Balasan admin berhasil disimpan.'
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Tidak ada perubahan data.'
            });
        }
    } catch (error) {
        console.error(' Error menyimpan balasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menyimpan balasan.',
            error: error.message
        });
    }
});

app.delete('/api/ulasan/:id', async (req, res) => {
    const id_ulasan = req.params.id;

    if (!id_ulasan || isNaN(id_ulasan)) {
        return res.status(400).json({
            success: false,
            message: 'ID ulasan tidak valid.'
        });
    }

    try {
        const [checkResult] = await pool.query(
            'SELECT id_ulasan FROM ulasan WHERE id_ulasan = ?',
            [id_ulasan]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ulasan tidak ditemukan.'
            });
        }

        const [result] = await pool.query(
            'DELETE FROM ulasan WHERE id_ulasan = ?',
            [id_ulasan]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Ulasan berhasil dihapus.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus ulasan.'
            });
        }
    } catch (error) {
        console.error(' Error menghapus ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus ulasan.',
            error: error.message
        });
    }
});

app.put('/api/ulasan/:id', async (req, res) => {
    const id_ulasan = req.params.id;
    const { nama_pengulas, rating_bintang, komentar } = req.body;

    if (!nama_pengulas || !rating_bintang || !komentar) {
        return res.status(400).json({
            success: false,
            message: 'Nama, rating, dan komentar wajib diisi.'
        });
    }

    try {
        const [result] = await pool.query(
            'UPDATE ulasan SET nama_pengulas = ?, rating_bintang = ?, komentar = ? WHERE id_ulasan = ?',
            [nama_pengulas, rating_bintang, komentar, id_ulasan]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({
                success: true,
                message: 'Ulasan berhasil diperbarui.'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Ulasan tidak ditemukan.'
            });
        }
    } catch (error) {
        console.error(' Error memperbarui ulasan:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui ulasan.',
            error: error.message
        });
    }
});

app.get('/api/test-balasan/:id', async (req, res) => {
    const id_ulasan = req.params.id;
    try {
        const [result] = await pool.query(
            'SELECT * FROM ulasan WHERE id_ulasan = ?',
            [id_ulasan]
        );

        if (result.length > 0) {
            res.status(200).json({
                success: true,
                message: 'Data ulasan ditemukan',
                data: result[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Ulasan tidak ditemukan'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error test balasan',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/tampilan/view_index.html'));
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server berjalan dengan baik',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'Endpoint API tidak ditemukan.'
        });
    }

    res.status(404).json({
        success: false,
        message: 'Halaman tidak ditemukan.'
    });
});

app.use((error, req, res, next) => {
    console.error(' Unhandled Error:', error);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(` Server berjalan di http://localhost:${PORT}`);
});