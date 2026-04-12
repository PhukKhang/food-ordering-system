from app.database import SessionLocal
from app.models import DonHang, KhachHang, TaiKhoan, ChiTietDonHang
import datetime

db = SessionLocal()

try:
    # Clear old orders so we don't duplicate
    db.query(ChiTietDonHang).delete()
    db.query(DonHang).delete()
    db.commit()

    kh = db.query(KhachHang).first()
    if not kh:
        tk = TaiKhoan(tenDangNhap="khtest_db", matKhau="123", loaiTaiKhoan="customer")
        db.add(tk)
        db.commit()
        db.refresh(tk)
        kh = KhachHang(maTaiKhoan=tk.maTaiKhoan, hoTen="Khách Hàng Ngẫu Nhiên", soDienThoai="0909090909")
        db.add(kh)
        db.commit()
        db.refresh(kh)

    orders_data = [
        DonHang(maKhachHang=kh.maKhachHang, ngayDat=datetime.datetime.now(), tongTien=185000, trangThaiDonHang='pending', ghiChu='Giao nhanh', diaChiGiaoHang='Quận 1', soDienThoaiNhan='0901234567'),
        DonHang(maKhachHang=kh.maKhachHang, ngayDat=datetime.datetime.now() - datetime.timedelta(hours=2), tongTien=590000, trangThaiDonHang='completed', ghiChu='Thêm tương', diaChiGiaoHang='Quận 3', soDienThoaiNhan='0901234567'),
        DonHang(maKhachHang=kh.maKhachHang, ngayDat=datetime.datetime.now() - datetime.timedelta(hours=5), tongTien=45000, trangThaiDonHang='delivering', ghiChu='', diaChiGiaoHang='Bình Thạnh', soDienThoaiNhan='0901234567'),
        DonHang(maKhachHang=kh.maKhachHang, ngayDat=datetime.datetime.now() - datetime.timedelta(hours=10), tongTien=350000, trangThaiDonHang='confirmed', ghiChu='1 xốt phô mai', diaChiGiaoHang='Gò Vấp', soDienThoaiNhan='0901234567'),
    ]

    for o in orders_data:
        db.add(o)

    db.commit()
    print("Seeded orders using SQLAlchemy successfully!")
except Exception as e:
    print("Seed error SQLAlchemy:", e)
finally:
    db.close()
