from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, deps

router = APIRouter(prefix="/cart")

@router.post("/add")
def add(item: schemas.CartItem, user_id: int, db: Session = Depends(deps.get_db)):
    # 1. Tìm giỏ hàng hoặc tạo mới
    cart = db.query(models.GioHang).filter_by(maKhachHang=user_id).first()
    if not cart:
        cart = models.GioHang(maKhachHang=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # 2. Tìm xem món ăn đã có trong giỏ chưa
    ct = db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang, maMon=item.maMon).first()
    
    if ct:
        # Đã có -> Cộng dồn số lượng
        ct.soLuong += item.soLuong
    else:
        # Chưa có -> Tạo mới chi tiết
        ct = models.ChiTietGioHang(
            maGioHang=cart.maGioHang,
            maMon=item.maMon,
            soLuong=item.soLuong
        )
        db.add(ct)

    db.commit()
    return {"msg": "added_or_updated"}

@router.put("/update/{user_id}/{product_id}")
def update_cart_quantity(user_id: int, product_id: int, so_luong: int, db: Session = Depends(deps.get_db)):
    cart = db.query(models.GioHang).filter_by(maKhachHang=user_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    ct = db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang, maMon=product_id).first()
    if ct:
        if so_luong <= 0:
            db.delete(ct)
        else:
            ct.soLuong = so_luong
        db.commit()
        return {"msg": "updated"}
    return {"msg": "item_not_found"}

@router.delete("/remove/{user_id}/{product_id}")
def remove_from_cart(user_id: int, product_id: int, db: Session = Depends(deps.get_db)):
    cart = db.query(models.GioHang).filter_by(maKhachHang=user_id).first()
    if not cart:
        return {"msg": "Cart not found"}
    
    item = db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang, maMon=product_id).first()
    if item:
        db.delete(item)
        db.commit()
    
    return {"msg": "removed"}

@router.delete("/clear/{user_id}")
def clear_cart(user_id: int, db: Session = Depends(deps.get_db)):
    cart = db.query(models.GioHang).filter_by(maKhachHang=user_id).first()
    if cart:
        db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang).delete()
        db.commit()
    return {"msg": "cleared"}

@router.get("/{user_id}")
def get_cart(user_id: int, db: Session = Depends(deps.get_db)):
    cart = db.query(models.GioHang).filter_by(maKhachHang=user_id).first()
    if not cart:
        return []
    
    items = db.query(models.ChiTietGioHang).filter_by(maGioHang=cart.maGioHang).all()
    result = []
    for item in items:
        mon = db.query(models.MonAn).get(item.maMon)
        if mon:
            result.append({
                "maMon": mon.maMon,
                "tenMon": mon.tenMon,
                "giaTien": mon.giaTien,
                "hinhAnh": mon.hinhAnh,
                "soLuong": item.soLuong
            })
    return result