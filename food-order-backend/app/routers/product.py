import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from .. import models, schemas, deps

router = APIRouter(prefix="/products")

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(deps.verify_token_admin)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File form không phải là hình ảnh")
    
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"static/uploads/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Trả về đường link URL để React có thể gọi
    return {"url": f"http://localhost:8000/{file_path}"}

@router.post("/")
def create(data: schemas.ProductCreate, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    p = models.MonAn(**data.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.get("/all")
def get_all_admin(db: Session = Depends(deps.get_db)):
    """Dành cho admin: xem toàn bộ món ăn kể cả đã xóa mềm"""
    return db.query(models.MonAn).order_by(models.MonAn.maMon.desc()).all()

@router.get("/")
def get_all(db: Session = Depends(deps.get_db)):
    # Chỉ trả về các món chưa bị xóa mềm (daXoa = False hoặc NULL)
    return db.query(models.MonAn).filter(
        (models.MonAn.daXoa == False) | (models.MonAn.daXoa == None)
    ).order_by(models.MonAn.maMon.desc()).all()

@router.delete("/{maMon}")
def delete_product(maMon: int, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    p = db.query(models.MonAn).filter(models.MonAn.maMon == maMon).first()
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
    # Soft delete: đánh dấu đã xóa, không xóa khỏi DB
    # Dữ liệu vẫn còn để đơn hàng cũ tra cứu được
    p.daXoa = True
    db.commit()
    return {"message": "Đã xóa thành công (món ăn vẫn lưu trong hệ thống)"}

@router.put("/{maMon}")
def update_product(maMon: int, data: schemas.ProductUpdate, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    """Chỉnh sửa thông tin món ăn (chỉ cập nhật các field được gửi lên)"""
    p = db.query(models.MonAn).filter(models.MonAn.maMon == maMon).first()
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
    # Chỉ cập nhật các field không phải None
    update_data = data.dict(exclude_none=True)
    for field, value in update_data.items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p

@router.put("/{maMon}/restore")
def restore_product(maMon: int, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    """Khôi phục món ăn đã bị xóa mềm — đưa lại lên menu"""
    p = db.query(models.MonAn).filter(models.MonAn.maMon == maMon).first()
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
    if not p.daXoa:
        raise HTTPException(status_code=400, detail="Món ăn này chưa bị xóa")
    p.daXoa = False
    db.commit()
    return {"message": "Đã khôi phục món ăn thành công"}

@router.put("/{maMon}/toggle-status")
def toggle_status(maMon: int, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_staff_or_admin)):
    p = db.query(models.MonAn).filter(models.MonAn.maMon == maMon).first()
    if not p:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
    
    # Đảo ngược trạng thái conHang đang có
    p.conHang = not p.conHang
    db.commit()
    db.refresh(p)
    return p

import random
@router.get("/seed-fake-system-antigravity")
def seed_fake_system(db: Session = Depends(deps.get_db)):
    categories_data = [
        {"tendanhmuc": "Món Chính", "mota": "Cơm, bún, phở, đồ ăn no"},
        {"tendanhmuc": "Đồ Ăn Vặt", "mota": "Đồ chiên rán, bánh tráng, xiên que"},
        {"tendanhmuc": "Đồ Uống", "mota": "Trà sữa, nước ngọt, sinh tố"},
        {"tendanhmuc": "Tráng Miệng", "mota": "Bánh ngọt, kem, chè"},
    ]
    for cat in categories_data:
        if not db.query(models.DanhMuc).filter_by(tenDanhMuc=cat["tendanhmuc"]).first():
            db.add(models.DanhMuc(tenDanhMuc=cat["tendanhmuc"], moTa=cat["mota"]))
    db.commit()

    cat_ids = [c.maDanhMuc for c in db.query(models.DanhMuc).all()]
    if not cat_ids: return {"msg": "No cat"}

    foods_data = [
        {"tenmon": "Phở Bò Kobe Hảo Hạng", "gia": 85000, "hinhanh": "https://img.pikbest.com/origin/09/20/46/74ypIkbEsTkC9.jpg!w700wp", "mota": "Phở nước lèo hầm xương 24h"},
        {"tenmon": "Cơm Tấm Sườn Bì Chả", "gia": 45000, "hinhanh": "https://cdn.tgdd.vn/Files/2021/07/23/1369989/4-cach-uop-suon-com-tam-mem-ngon-dam-da-huong-vi-tinh-tuy-202107231454508933.jpg", "mota": "Sườn nướng than hoa siêu to khổng lồ"},
        {"tenmon": "Bún Đậu Mắm Tôm Tràn Mẹt", "gia": 55000, "hinhanh": "https://static.vinwonders.com/production/bun-dau-mam-tom-ha-noi-1.jpg", "mota": "Mắm tôm Thanh Hóa thơm dậy mùi, đặc sản vỉa hè"},
        {"tenmon": "Bánh Mì Heo Quay", "gia": 25000, "hinhanh": "https://file.hstatic.net/1000300185/article/1_96f1311b5ff0453fac4d31d7e2e7b8c2_1024x1024.jpg", "mota": "Bánh mì giòn rụm, heo quay giòn bì"},
        {"tenmon": "Trà Sữa Trân Châu Đường Đen", "gia": 30000, "hinhanh": "https://bizweb.dktcdn.net/100/363/677/articles/hinh-anh-tra-sua-tran-chau-duong-den.jpg?v=1602143169860", "mota": "Trà đậm vị, trân châu dai giòn sần sật"}
    ]
    count = 0
    for food in foods_data:
        if not db.query(models.MonAn).filter_by(tenMon=food["tenmon"]).first():
            db.add(models.MonAn(tenMon=food["tenmon"], giaTien=food["gia"], hinhAnh=food["hinhanh"], moTa=food["mota"], conHang=True, phanTramGiamGia=0, soLuongTon=100, maDanhMuc=random.choice(cat_ids), daXoa=False))
            count += 1
    db.commit()
    return {"msg": f"Seeded {count} products"}