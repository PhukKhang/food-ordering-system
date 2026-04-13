from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, deps
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/categories")


class DanhMucCreate(BaseModel):
    tenDanhMuc: str
    moTa: Optional[str] = None


@router.get("/")
def get_all_categories(db: Session = Depends(deps.get_db)):
    """Lấy toàn bộ danh mục món ăn"""
    categories = db.query(models.DanhMuc).order_by(models.DanhMuc.maDanhMuc).all()
    return [
        {
            "maDanhMuc": c.maDanhMuc,
            "tenDanhMuc": c.tenDanhMuc,
            "moTa": c.moTa,
        }
        for c in categories
    ]


@router.post("/")
def create_category(data: DanhMucCreate, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    """Tạo danh mục mới (dành cho Quản lý)"""
    existing = db.query(models.DanhMuc).filter_by(tenDanhMuc=data.tenDanhMuc).first()
    if existing:
        raise HTTPException(status_code=400, detail="Danh mục này đã tồn tại")
    category = models.DanhMuc(tenDanhMuc=data.tenDanhMuc, moTa=data.moTa)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{maDanhMuc}")
def delete_category(maDanhMuc: int, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    """Xóa danh mục (dành cho Quản lý)"""
    category = db.query(models.DanhMuc).filter_by(maDanhMuc=maDanhMuc).first()
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    
    # Gỡ bỏ liên kết danh mục cho tất cả các món ăn đang thuộc danh mục này
    db.query(models.MonAn).filter_by(maDanhMuc=maDanhMuc).update({"maDanhMuc": None})
    
    db.delete(category)
    db.commit()
    return {"message": "Đã xóa danh mục thành công"}


@router.put("/{maDanhMuc}")
def update_category(maDanhMuc: int, data: DanhMucCreate, db: Session = Depends(deps.get_db), current_user: dict = Depends(deps.verify_token_admin)):
    """Cập nhật danh mục (dành cho Quản lý)"""
    category = db.query(models.DanhMuc).filter_by(maDanhMuc=maDanhMuc).first()
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    
    # Kiểm tra trùng tên (nhưng khác id hiện tại)
    existing = db.query(models.DanhMuc).filter_by(tenDanhMuc=data.tenDanhMuc).first()
    if existing and existing.maDanhMuc != maDanhMuc:
        raise HTTPException(status_code=400, detail="Tên danh mục này đã tồn tại")
        
    category.tenDanhMuc = data.tenDanhMuc
    category.moTa = data.moTa
    db.commit()
    db.refresh(category)
    return category


@router.get("/seed")
def seed_categories(db: Session = Depends(deps.get_db)):
    """Nạp 6 danh mục đồ ăn nhanh mặc định vào Database."""
    default_categories = [
        {"tenDanhMuc": "Combo 1 Người",          "moTa": "Combo tiết kiệm dành cho 1 người"},
        {"tenDanhMuc": "Combo Nhóm",              "moTa": "Combo chia sẻ dành cho nhóm bạn"},
        {"tenDanhMuc": "Gà Rán - Gà Quay",       "moTa": "Các món gà giòn rụm hấp dẫn"},
        {"tenDanhMuc": "Burger",                  "moTa": "Burger bò, gà và các biến thể"},
        {"tenDanhMuc": "Thức Ăn Nhẹ",            "moTa": "Khoai tây, nugget và các món ăn vặt"},
        {"tenDanhMuc": "Thức Uống & Tráng Miệng","moTa": "Nước ngọt, trà sữa và kem tráng miệng"},
    ]

    added = []
    skipped = []
    for item in default_categories:
        existing = db.query(models.DanhMuc).filter_by(tenDanhMuc=item["tenDanhMuc"]).first()
        if existing:
            skipped.append(item["tenDanhMuc"])
        else:
            cat = models.DanhMuc(tenDanhMuc=item["tenDanhMuc"], moTa=item["moTa"])
            db.add(cat)
            added.append(item["tenDanhMuc"])

    db.commit()
    return {
        "message": f"Đã thêm {len(added)} danh mục, bỏ qua {len(skipped)} danh mục đã tồn tại.",
        "added": added,
        "skipped": skipped
    }
