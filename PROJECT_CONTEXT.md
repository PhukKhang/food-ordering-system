# BỐI CẢNH DỰ ÁN: FOOD ORDERING SYSTEM

## 1. Tổng quan & Nghiệp vụ (SRS)
- **Hệ thống:** Web Application đặt đồ ăn trực tuyến.
- **Công nghệ dự kiến:** Frontend (React + Vite), Backend (FastAPI), Database (SQL/PostgreSQL).
- **Phân quyền (3 roles):**
  - **Khách hàng:** Xem menu không cần login. Login để thêm món vào giỏ, đặt hàng, thanh toán (Mô phỏng/COD), hủy đơn (khi đang pending/confirmed).
  - **Nhân viên:** Duyệt đơn (chuyển trạng thái pending -> confirmed -> preparing -> delivering -> completed), đổi trạng thái món ăn (available / out_of_stock).
  - **Quản lý:** Quyền của nhân viên + Thêm/sửa/xóa món ăn, quản lý danh mục, xem thống kê.

## 2. Kiến trúc Cơ sở dữ liệu (Database Schema)
Hệ thống sử dụng các bảng chính sau (Đã chốt ERD chuẩn hóa):
1. Nhóm User: `TaiKhoan`, `KhachHang` (FK: maTaiKhoan), `NhanVien` (FK: maTaiKhoan), `DiaChi` (FK: maKhachHang).
2. Nhóm Sản phẩm: `MonAn`, `DanhMuc`, `PhanLoaiMon` (Bảng trung gian N-N giữa MonAn và DanhMuc).
  - *Lưu ý: Bảng MonAn dùng tính năng Soft Delete (cột `daXoa`) và `trangThai` (available/out_of_stock).*
3. Nhóm Giao dịch: `GioHang`, `ChiTietGioHang`, `DonHang`, `ChiTietDonHang`, `ThanhToan`.

## 3. Tiến độ hiện tại (Tới ngày hôm nay)
- Đã thiết kế xong Use Case, Class Diagram, Sequence Diagram (Login, Thêm món, Đặt hàng, Duyệt đơn).
- **Đã setup Frontend:** Khởi tạo Vite + React + React Router Dom.
- **Đã code:** `App.jsx` (Routing), `Login.jsx` (Giao diện tĩnh), `Home.jsx` (Hiển thị lưới món ăn bằng Dummy Data).

## 4. Nhiệm vụ tiếp theo yêu cầu Agent thực hiện
1. Tạo file `src/context/CartContext.jsx` để quản lý state Giỏ hàng (dùng Context API).
2. Kết nối nút "Mua ngay" ở `Home.jsx` với hàm `addToCart` trong Context.
3. Tạo trang `src/pages/Cart.jsx` để hiển thị giỏ hàng và tính tổng tiền.