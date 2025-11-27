-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 27 Nov 2025 pada 17.34
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_jaguar`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `galeri_foto`
--

CREATE TABLE `galeri_foto` (
  `id_foto` int(11) NOT NULL,
  `nama_foto` varchar(255) NOT NULL,
  `path_file` varchar(255) NOT NULL,
  `tanggal_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `galeri_foto`
--

INSERT INTO `galeri_foto` (`id_foto`, `nama_foto`, `path_file`, `tanggal_upload`) VALUES
(10, 'bubur ayam', 'images/galeri/galeri-10.png', '2025-11-26 14:53:52'),
(11, 'mukbang', 'images/galeri/galeri-11.png', '2025-11-26 14:54:05'),
(12, 'pamer', 'images/galeri/galeri-12.jpg', '2025-11-26 14:54:16'),
(13, 'toko', 'images/galeri/galeri-13.png', '2025-11-26 14:54:29'),
(14, 'tim', 'images/galeri/galeri-14.png', '2025-11-26 14:54:41'),
(15, 'layan', 'images/galeri/galeri-15.jpg', '2025-11-26 14:54:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `informasi_toko`
--

CREATE TABLE `informasi_toko` (
  `alamat_lengkap` text NOT NULL,
  `jam_operasional` varchar(100) NOT NULL,
  `nomor_whatsapp` varchar(20) NOT NULL,
  `lokasi_gmaps_link` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `informasi_toko`
--

INSERT INTO `informasi_toko` (`alamat_lengkap`, `jam_operasional`, `nomor_whatsapp`, `lokasi_gmaps_link`) VALUES
('Jl. Antara, Klp. Tiga, Kec. Tj. Karang Bar., Kota Bandar Lampung, Lampung 35119', '05.00-12.00', '089692783848', 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3972.0420204957236!2d105.2448795!3d-5.4105714!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40da5edc62764b%3A0x63793296b57ec0dc!2sPasar%20Tamin!5e0!3m2!1sid!2sid!4v1764086162810!5m2!1sid!2sid');

-- --------------------------------------------------------

--
-- Struktur dari tabel `konten`
--

CREATE TABLE `konten` (
  `tentang_kami` text DEFAULT NULL,
  `visi` varchar(255) DEFAULT NULL,
  `keunggulan` text DEFAULT NULL,
  `slogan` varchar(255) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `konten`
--

INSERT INTO `konten` (`tentang_kami`, `visi`, `keunggulan`, `slogan`, `last_updated`) VALUES
('Bubur Ayam Bang Jaka telah menyajikan bubur ayam nikmat sejak 1998, selalu menekankan cita rasa asli dan layanan hangat bagi setiap pelanggan. Dengan resep turun-temurun dan bahan segar berkualitas, kami berkomitmen menjadi favorit bagi semua yang mencari kenikmatan sederhana namun memuaskan. Keunggulan kami terletak pada rasa yang konsisten, pelayanan cepat, dan suasana yang membuat setiap kunjungan terasa spesial. Berlandaskan visi untuk terus menjaga kualitas dan kepuasan pelanggan, kami percaya setiap mangkuk bubur yang tersaji menghadirkan kehangatan dan kebahagiaan. Bubur Hangat, Rasa Selalu Nikmat!', 'Menjadi pilihan utama bubur ayam berkualitas dengan rasa khas yang selalu dinikmati semua kalangan.', 'Resep turun-temurun sejak 1998\nBahan segar dan berkualitas\nPelayanan cepat dan ramah\nRasa konsisten dan autentik', 'Bubur Hangat, Rasa Selalu Nikmat!', '2025-11-27 04:21:11');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu`
--

CREATE TABLE `menu` (
  `id_menu` int(11) NOT NULL,
  `menu` varchar(255) NOT NULL,
  `harga` decimal(10,2) NOT NULL,
  `status_menu` enum('Tersedia','Habis') NOT NULL DEFAULT 'Tersedia',
  `foto` varchar(255) DEFAULT NULL,
  `keterangan_menu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `menu`
--

INSERT INTO `menu` (`id_menu`, `menu`, `harga`, `status_menu`, `foto`, `keterangan_menu`) VALUES
(1, 'Bubur Ayam', 12000.00, 'Tersedia', 'menu-1763697433124.png', 'Bubur lembut dengan suwiran ayam, topping bawang goreng, dan kuah gurih.'),
(3, 'Sate Ati', 2000.00, 'Tersedia', 'menu-1764152373902-526794990.png', 'Sate ati ampela berbumbu manis gurih, cocok sebagai pelengkap bubur.'),
(4, 'Telur Asin', 5000.00, 'Tersedia', 'menu-1764152411589-471871524.png', 'Telur asin dengan rasa gurih khas, menambah kenikmatan saat disantap bersama bubur.'),
(5, 'Sate telur puyuh', 2000.00, 'Tersedia', 'menu-1764152452287-787394192.jpg', 'Sate telur puyuh yang gurih dan kaya protein, disajikan dalam tusukan kecil praktis.');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pesanan`
--

CREATE TABLE `pesanan` (
  `id` int(11) NOT NULL,
  `tanggal_pesanan` date NOT NULL DEFAULT curdate(),
  `waktu_pesanan` datetime NOT NULL DEFAULT current_timestamp(),
  `nama_pelanggan` varchar(255) NOT NULL,
  `nomor_whatsapp` varchar(20) DEFAULT NULL,
  `jumlah_total` decimal(10,2) NOT NULL,
  `detail_pesanan` text DEFAULT NULL,
  `status_pesanan` varchar(50) NOT NULL DEFAULT 'Menunggu Konfirmasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pesanan`
--

INSERT INTO `pesanan` (`id`, `tanggal_pesanan`, `waktu_pesanan`, `nama_pelanggan`, `nomor_whatsapp`, `jumlah_total`, `detail_pesanan`, `status_pesanan`) VALUES
(3, '2025-11-26', '2025-11-26 08:30:00', 'Adi Santoso', '081234567890', 24000.00, 'Bubur Ayam x2 (Rp 24.000);', 'Selesai'),
(4, '2025-11-26', '2025-11-26 09:05:00', 'Siti Aisyah', '081511223344', 26000.00, 'Bubur Ayam x1 (Rp 12.000); Sate Ati x7 (Rp 14.000);', 'Selesai'),
(5, '2025-11-25', '2025-11-25 15:00:00', 'Rian Hidayat', '087899887766', 17000.00, 'Bubur Ayam x1 (Rp 12.000); Telur Asin x1 (Rp 5.000);', 'Selesai'),
(6, '2025-11-25', '2025-11-25 10:40:00', 'Maria Ulfa', '081100110011', 30000.00, 'Telur Asin x6 (Rp 30.000);', 'Dibatalkan'),
(7, '2025-11-26', '2025-11-26 09:15:00', 'Bayu Kusuma', '081298765432', 16000.00, 'Bubur Ayam x1 (Rp 12.000); Sate telur puyuh x2 (Rp 4.000);', 'Selesai'),
(8, '2025-11-26', '2025-11-26 09:30:00', 'Lestari', '089988776655', 52000.00, 'Bubur Ayam x4 (Rp 48.000); Telur Asin x1 (Rp 5.000);', 'Dibatalkan'),
(9, '2025-11-24', '2025-11-24 11:55:00', 'Herman', '081333445566', 12000.00, 'Bubur Ayam x1 (Rp 12.000);', 'Selesai'),
(10, '2025-11-24', '2025-11-24 13:00:00', 'Wati', '085712341234', 28000.00, 'Bubur Ayam x2 (Rp 24.000); Sate Ati x2 (Rp 4.000);', 'Selesai'),
(11, '2025-11-26', '2025-11-26 07:00:00', 'Edo', '081122334455', 6000.00, 'Sate Ati x3 (Rp 6.000);', 'Selesai'),
(12, '2025-11-26', '2025-11-26 07:15:00', 'Cahya', '081701701701', 19000.00, 'Bubur Ayam x1 (Rp 12.000); Telur Asin x1 (Rp 5.000); Sate Ati x1 (Rp 2.000);', 'Selesai'),
(13, '2025-11-23', '2025-11-23 09:35:00', 'Fajar', '089608960896', 48000.00, 'Bubur Ayam x4 (Rp 48.000);', 'Selesai'),
(14, '2025-11-26', '2025-11-26 09:40:00', 'Guntur', '081212121212', 10000.00, 'Telur Asin x2 (Rp 10.000);', 'Selesai'),
(15, '2025-11-26', '2025-11-26 09:45:00', 'Hana', '085234567890', 14000.00, 'Bubur Ayam x1 (Rp 12.000); Sate telur puyuh x1 (Rp 2.000);', 'Dibatalkan'),
(24, '2025-11-27', '2025-11-27 00:23:06', 'putrinn', '089692783848', 24000.00, 'Bubur Ayam x2 (Rp 24.000);', 'Selesai'),
(25, '2025-11-27', '2025-11-27 03:19:45', 'putri888', '089692783848', 30000.00, 'Telur Asin x6 (Rp 30.000);', 'Dikonfirmasi'),
(26, '2025-11-27', '2025-11-27 11:20:21', 'putriiiii3', '089692783848', 41000.00, 'Bubur Ayam x3 (Rp 36.000); Telur Asin x1 (Rp 5.000);', 'Dikonfirmasi'),
(27, '2025-11-27', '2025-11-27 23:27:04', 'putri888', '089692783848', 2000.00, 'Sate telur puyuh x1 (Rp 2.000);', 'Dikonfirmasi');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ulasan`
--

CREATE TABLE `ulasan` (
  `id_ulasan` int(11) NOT NULL,
  `tanggal_ulasan` date NOT NULL,
  `waktu_ulasan` datetime NOT NULL,
  `nama_pengulas` varchar(255) NOT NULL,
  `rating_bintang` tinyint(4) NOT NULL CHECK (`rating_bintang` >= 1 and `rating_bintang` <= 5),
  `komentar` text DEFAULT NULL,
  `balasan_admin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ulasan`
--

INSERT INTO `ulasan` (`id_ulasan`, `tanggal_ulasan`, `waktu_ulasan`, `nama_pengulas`, `rating_bintang`, `komentar`, `balasan_admin`) VALUES
(101, '2025-11-17', '2025-11-17 08:00:00', 'Siti', 5, 'Buburnya selalu enak dan toppingnya melimpah! Favorit keluarga.', ''),
(102, '2025-11-19', '2025-11-19 11:30:00', 'Deny', 4, 'Pelayanan cepat. Cuma agak antri kalau pagi. Mungkin bisa ditambah kursi?', NULL),
(103, '2025-11-20', '2025-11-20 15:00:00', 'Budi Hartono', 5, 'Rasa autentik, tidak ada duanya! Selalu fresh.', NULL),
(114, '2025-11-27', '2025-11-27 00:31:21', 'putrinn', 5, 'wagelasee mantap', 'iyakah?');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `galeri_foto`
--
ALTER TABLE `galeri_foto`
  ADD PRIMARY KEY (`id_foto`);

--
-- Indeks untuk tabel `konten`
--
ALTER TABLE `konten`
  ADD PRIMARY KEY (`last_updated`);

--
-- Indeks untuk tabel `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`);

--
-- Indeks untuk tabel `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`id_ulasan`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `galeri_foto`
--
ALTER TABLE `galeri_foto`
  MODIFY `id_foto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  MODIFY `id_ulasan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
