```sql
-- =====================================================
-- DATABASE: FOOD ORDERING SYSTEM (ERD FINAL VERSION)
-- =====================================================

CREATE DATABASE food_ordering_system;
\c food_ordering_system;

-- =====================================================
-- TABLE: TaiKhoan
-- =====================================================

CREATE TABLE TaiKhoan (
    maTaiKhoan SERIAL PRIMARY KEY,
    tenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    matKhau TEXT NOT NULL,
    loaiTaiKhoan VARCHAR(20) CHECK (loaiTaiKhoan IN ('customer','staff','admin')),
    trangThai BOOLEAN DEFAULT TRUE,
    ngayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLE: KhachHang
-- =====================================================

CREATE TABLE KhachHang (
    maKhachHang SERIAL PRIMARY KEY,
    maTaiKhoan INT UNIQUE,
    hoTen VARCHAR(100),
    soDienThoai VARCHAR(15),
    email VARCHAR(100),
    diemTichLuy INT DEFAULT 0,

    FOREIGN KEY (maTaiKhoan) REFERENCES TaiKhoan(maTaiKhoan)
);

-- =====================================================
-- TABLE: NhanVien
-- =====================================================

CREATE TABLE NhanVien (
    maNhanVien SERIAL PRIMARY KEY,
    maTaiKhoan INT UNIQUE,
    hoTen VARCHAR(100),
    soDienThoai VARCHAR(15),
    caLamViec VARCHAR(50),
    luong NUMERIC(10,2),

    FOREIGN KEY (maTaiKhoan) REFERENCES TaiKhoan(maTaiKhoan)
);

-- =====================================================
-- TABLE: DanhMuc
-- =====================================================

CREATE TABLE DanhMuc (
    maDanhMuc SERIAL PRIMARY KEY,
    tenDanhMuc VARCHAR(100) NOT NULL,
    moTa TEXT
);

-- =====================================================
-- TABLE: MonAn
-- =====================================================

CREATE TABLE MonAn (
    maMon SERIAL PRIMARY KEY,
    tenMon VARCHAR(100) NOT NULL,
    giaTien NUMERIC(10,2) NOT NULL,
    hinhAnh TEXT,
    moTa TEXT,
    conHang BOOLEAN DEFAULT TRUE,
    phanTramGiamGia NUMERIC(5,2) DEFAULT 0,
    soLuongTon INT DEFAULT 0,
    maDanhMuc INT,

    FOREIGN KEY (maDanhMuc) REFERENCES DanhMuc(maDanhMuc)
);

-- =====================================================
-- TABLE: GioHang
-- =====================================================

CREATE TABLE GioHang (
    maGioHang SERIAL PRIMARY KEY,
    maKhachHang INT UNIQUE,
    ngayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
);

-- =====================================================
-- TABLE: ChiTietGioHang
-- =====================================================

CREATE TABLE ChiTietGioHang (
    maGioHang INT,
    maMon INT,
    soLuong INT CHECK (soLuong > 0),

    PRIMARY KEY (maGioHang, maMon),

    FOREIGN KEY (maGioHang) REFERENCES GioHang(maGioHang) ON DELETE CASCADE,
    FOREIGN KEY (maMon) REFERENCES MonAn(maMon)
);

-- =====================================================
-- TABLE: DonHang
-- =====================================================

CREATE TABLE DonHang (
    maDonHang SERIAL PRIMARY KEY,
    maKhachHang INT,
    ngayDat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tongTien NUMERIC(12,2),
    trangThaiDonHang VARCHAR(50) CHECK (
        trangThaiDonHang IN ('pending','confirmed','preparing','delivering','completed','cancelled')
    ),
    ghiChu TEXT,
    diaChiGiaoHang TEXT,
    soDienThoaiNhan VARCHAR(15),

    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
);

-- =====================================================
-- TABLE: ChiTietDonHang
-- =====================================================

CREATE TABLE ChiTietDonHang (
    maDonHang INT,
    maMon INT,
    soLuong INT CHECK (soLuong > 0),
    giaBanLucDo NUMERIC(10,2),

    PRIMARY KEY (maDonHang, maMon),

    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang) ON DELETE CASCADE,
    FOREIGN KEY (maMon) REFERENCES MonAn(maMon)
);

-- =====================================================
-- TABLE: ThanhToan
-- =====================================================

CREATE TABLE ThanhToan (
    maThanhToan SERIAL PRIMARY KEY,
    maDonHang INT UNIQUE,
    hinhThucTT VARCHAR(20) CHECK (hinhThucTT IN ('cash','online')),
    ngayThanhToan TIMESTAMP,
    soTien NUMERIC(12,2),
    trangThaiThanhToan BOOLEAN,

    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_monan_danhmuc ON MonAn(maDanhMuc);
CREATE INDEX idx_donhang_khachhang ON DonHang(maKhachHang);
CREATE INDEX idx_donhang_trangthai ON DonHang(trangThaiDonHang);
CREATE INDEX idx_chitietdonhang_mon ON ChiTietDonHang(maMon);

-- =====================================================
-- TRIGGER: AUTO UPDATE TOTAL PRICE
-- =====================================================

CREATE OR REPLACE FUNCTION update_tong_tien()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE DonHang
    SET tongTien = (
        SELECT COALESCE(SUM(soLuong * giaBanLucDo), 0)
        FROM ChiTietDonHang
        WHERE maDonHang = NEW.maDonHang
    )
    WHERE maDonHang = NEW.maDonHang;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_tongtien
AFTER INSERT OR UPDATE ON ChiTietDonHang
FOR EACH ROW
EXECUTE FUNCTION update_tong_tien();
```
