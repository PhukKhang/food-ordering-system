from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, auth, deps, schemas

router = APIRouter(prefix="/auth")

@router.get("/accounts")
def list_accounts(db: Session = Depends(deps.get_db)):
    accounts = db.query(models.TaiKhoan).all()
    return [{"username": acc.tenDangNhap, "role": acc.loaiTaiKhoan} for acc in accounts]

@router.get("/create-admin")
def create_admin(db: Session = Depends(deps.get_db)):
    # Tạo acc mặc định
    admin = db.query(models.TaiKhoan).filter_by(tenDangNhap="admin").first()
    if not admin:
        admin = models.TaiKhoan(
            tenDangNhap="admin",
            matKhau=auth.hash_password("admin123"),
            loaiTaiKhoan="admin"
        )
        db.add(admin)
        db.commit()
        return {"msg": "Đã tạo tài khoản admin thành công!", "user": "admin", "pass": "admin123"}
    return {"msg": "Tài khoản admin đã tồn tại sẵn rồi nhé!"}

@router.post("/register")
def register(user_data: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    from sqlalchemy.exc import IntegrityError
    from fastapi import HTTPException
    try:
        user = models.TaiKhoan(
            tenDangNhap=user_data.username,
            matKhau=auth.hash_password(user_data.password),
            loaiTaiKhoan="customer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        kh = models.KhachHang(
            maTaiKhoan=user.maTaiKhoan,
            hoTen=user_data.username,
            soDienThoai="Chưa có"
        )
        db.add(kh)
        db.commit()

        return {"msg": "ok"}
    except Exception as e:
        db.rollback()
        # Kiểm tra xem có phải lỗi trùng tên không (IntegrityError thường chứa chữ UNIQUE)
        if "UNIQUE constraint failed" in str(e) or "unique constraint" in str(e).lower() or "UniqueViolation" in str(e):
            raise HTTPException(status_code=400, detail="Tên tài khoản này đã có người sử dụng. Vui lòng chọn tên khác!")
        raise HTTPException(status_code=400, detail="Lỗi phía máy chủ: " + str(e))

@router.post("/login")
def login(user_data: schemas.UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(models.TaiKhoan).filter_by(tenDangNhap=user_data.username).first()
    if not user or not auth.verify_password(user_data.password, user.matKhau):
        return {"error": "fail"}

    # Include role in token
    token = auth.create_token({"sub": user.tenDangNhap, "role": user.loaiTaiKhoan})
    
    kh = db.query(models.KhachHang).filter_by(maTaiKhoan=user.maTaiKhoan).first()
    kh_id = kh.maKhachHang if kh else None
    
    return {
        "access_token": token,
        "userId": kh_id,
        "username": user.tenDangNhap,
        "hoTen": kh.hoTen if kh else user.tenDangNhap,
        "role": user.loaiTaiKhoan
    }