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
    db.delete(category)
    db.commit()
    return {"message": "Đã xóa danh mục thành công"}
