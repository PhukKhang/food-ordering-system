from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, deps, schemas

router = APIRouter(prefix="/orders")

@router.post("/checkout")
def checkout(order_data: schemas.OrderCreate, db: Session = Depends(deps.get_db)):
    cart = db.query(models.GioHang).filter_by(maKhachHang=order_data.user_id).first()
    if not cart:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Không thấy giỏ hàng")
        
    items = db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang).all()
    if not items:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Giỏ hàng trống")

    import datetime
    
    order = models.DonHang(
        maKhachHang=order_data.user_id,
        ngayDat=datetime.datetime.now(),
        tongTien=0,
        trangThaiDonHang='pending',
        ghiChu=order_data.ghiChu,
        diaChiGiaoHang=order_data.diaChiGiaoHang,
        soDienThoaiNhan=order_data.soDienThoaiNhan
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    tong = 0
    for item in items:
        product = db.query(models.MonAn).get(item.maMon)
        if product:
            ct = models.ChiTietDonHang(
                maDonHang=order.maDonHang,
                maMon=item.maMon,
                soLuong=item.soLuong,
                giaBanLucDo=product.giaTien
            )
            db.add(ct)
            tong += product.giaTien * item.soLuong
        
        # Xóa món khỏi giỏ hàng
        db.delete(item)

    order.tongTien = tong
    db.commit()

    return {"order_id": order.maDonHang, "message": "Đặt hàng thành công!"}

@router.get("/")
def get_orders(db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_staff_or_admin)):
    orders = db.query(models.DonHang).order_by(models.DonHang.maDonHang.desc()).all()
    
    result = []
    for o in orders:
        kh = db.query(models.KhachHang).filter(models.KhachHang.maKhachHang == o.maKhachHang).first()
        
        result.append({
            "id": o.maDonHang,
            "khachHang": kh.hoTen if kh and kh.hoTen else (o.diaChiGiaoHang or "Khách vãng lai"),
            "sdt": kh.soDienThoai if kh and kh.soDienThoai else (o.soDienThoaiNhan or "Chưa có SDT"),
            "tongTien": o.tongTien if o.tongTien else 0,
            "trangThai": o.trangThaiDonHang if o.trangThaiDonHang else "pending",
            "thoiGian": str(o.ngayDat)[:16] if o.ngayDat else "Mới đây"
        })
    return result

@router.get("/history/{user_id}")
def get_user_history(user_id: int, db: Session = Depends(deps.get_db)):
    orders = db.query(models.DonHang).filter(models.DonHang.maKhachHang == user_id).order_by(models.DonHang.maDonHang.desc()).all()
    result = []
    for o in orders:
        items = db.query(models.ChiTietDonHang).filter(models.ChiTietDonHang.maDonHang == o.maDonHang).all()
        products = []
        for item in items:
            mon = db.query(models.MonAn).get(item.maMon)
            if mon:
                products.append({
                    "tenMon": mon.tenMon,
                    "soLuong": item.soLuong,
                    "hinhAnh": mon.hinhAnh,
                    "giaTien": item.giaBanLucDo
                })

        result.append({
            "id": o.maDonHang,
            "ngayDat": str(o.ngayDat)[:16] if o.ngayDat else "Mới đây",
            "tongTien": o.tongTien if o.tongTien else 0,
            "trangThai": o.trangThaiDonHang if o.trangThaiDonHang else "pending",
            "diaChiGiaoHang": o.diaChiGiaoHang,
            "ghiChu": o.ghiChu,
            "danhSachMon": products
        })
    return result

@router.put("/{order_id}/status")
def update_status(order_id: int, update_data: schemas.OrderStatusUpdate, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_staff_or_admin)):
    order = db.query(models.DonHang).filter(models.DonHang.maDonHang == order_id).first()
    if not order:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    order.trangThaiDonHang = update_data.trangThai
    db.commit()
    return {"message": "Đã cập nhật trạng thái"}

@router.put("/{order_id}/cancel")
def cancel_order_customer(order_id: int, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.get_current_user)):
    order = db.query(models.DonHang).filter(models.DonHang.maDonHang == order_id).first()
    if not order:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    if order.trangThaiDonHang not in ["pending", "confirmed"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Không thể hủy đơn hàng lúc này")
    
    order.trangThaiDonHang = "cancelled"
    db.commit()
    return {"message": "Đã hủy đơn hàng"}