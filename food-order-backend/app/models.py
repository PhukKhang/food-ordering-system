from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class TaiKhoan(Base):
    __tablename__ = "taikhoan"

    maTaiKhoan = Column("mataikhoan", Integer, primary_key=True)
    tenDangNhap = Column("tendangnhap", String, unique=True)
    matKhau = Column("matkhau", String)
    loaiTaiKhoan = Column("loaitaikhoan", String)

class KhachHang(Base):
    __tablename__ = "khachhang"

    maKhachHang = Column("makhachhang", Integer, primary_key=True)
    maTaiKhoan = Column("mataikhoan", Integer, ForeignKey("taikhoan.mataikhoan"))
    hoTen = Column("hoten", String)
    soDienThoai = Column("sodienthoai", String)

class DanhMuc(Base):
    __tablename__ = "danhmuc"

    maDanhMuc = Column("madanhmuc", Integer, primary_key=True)
    tenDanhMuc = Column("tendanhmuc", String, unique=True)
    moTa = Column("mota", String, nullable=True)

class MonAn(Base):
    __tablename__ = "monan"

    maMon = Column("mamon", Integer, primary_key=True)
    tenMon = Column("tenmon", String)
    giaTien = Column("giatien", Float)
    hinhAnh = Column("hinhanh", String)
    moTa = Column("mota", String)
    conHang = Column("conhang", Boolean)
    phanTramGiamGia = Column("phantramgiamgia", Float)
    soLuongTon = Column("soluongton", Integer)
    maDanhMuc = Column("madanhmuc", Integer, ForeignKey("danhmuc.madanhmuc"), nullable=True)
    daXoa = Column("daxoa", Boolean, default=False, nullable=False, server_default="0")

class GioHang(Base):
    __tablename__ = "giohang"

    maGioHang = Column("magiohang", Integer, primary_key=True)
    maKhachHang = Column("makhachhang", Integer, ForeignKey("khachhang.makhachhang"))

class ChiTietGioHang(Base):
    __tablename__ = "chitietgiohang"

    maGioHang = Column("magiohang", Integer, ForeignKey("giohang.magiohang"), primary_key=True)
    maMon = Column("mamon", Integer, ForeignKey("monan.mamon"), primary_key=True)
    soLuong = Column("soluong", Integer)

class DonHang(Base):
    __tablename__ = "donhang"

    maDonHang = Column("madonhang", Integer, primary_key=True)
    maKhachHang = Column("makhachhang", Integer, ForeignKey("khachhang.makhachhang"))
    ngayDat = Column("ngaydat", DateTime)
    tongTien = Column("tongtien", Float)
    trangThaiDonHang = Column("trangthaidonhang", String, default="pending")
    ghiChu = Column("ghichu", String)
    diaChiGiaoHang = Column("diachigiaohang", String)
    soDienThoaiNhan = Column("sodienthoainhan", String)

class ChiTietDonHang(Base):
    __tablename__ = "chitietdonhang"

    maDonHang = Column("madonhang", Integer, ForeignKey("donhang.madonhang"), primary_key=True)
    maMon = Column("mamon", Integer, ForeignKey("monan.mamon"), primary_key=True)
    soLuong = Column("soluong", Integer)
    giaBanLucDo = Column("giabanlucdo", Float)