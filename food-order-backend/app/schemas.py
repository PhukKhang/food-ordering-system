from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class ProductCreate(BaseModel):
    tenMon: str
    giaTien: float
    hinhAnh: str = ""
    moTa: str = ""
    conHang: bool = True
    phanTramGiamGia: float = 0.0
    soLuongTon: int = 0
    maDanhMuc: int = None

class ProductUpdate(BaseModel):
    tenMon: Optional[str] = None
    giaTien: Optional[float] = None
    hinhAnh: Optional[str] = None
    moTa: Optional[str] = None
    conHang: Optional[bool] = None
    maDanhMuc: Optional[int] = None

class CartItem(BaseModel):
    maMon: int
    soLuong: int

class OrderStatusUpdate(BaseModel):
    trangThai: str

class OrderCreate(BaseModel):
    user_id: int
    diaChiGiaoHang: str
    soDienThoaiNhan: str
    ghiChu: str = ""