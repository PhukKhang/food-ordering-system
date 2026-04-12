# Tài khoản Đăng nhập Hệ thống Mẫu

File này lưu trữ danh sách các tài khoản đang tồn tại trong hệ thống (PostgreSQL) cùng với mật khẩu và chức vụ để tiện cho việc kiểm thử (Testing) và vận hành.

## 1. Dành cho Ban Quản Trị / Nhân viên:
Tài khoản này dùng để truy cập vào Bảng Điểu Khiển (Dashboard), duyệt đơn, xem doanh thu và quản lý món ăn.

* **Bố Địa Chủ (Admin)**
  * Username: `admin`
  * Password: `admin123`
  * Chức vụ: Quản trị viên (Hiện Tab Quản Lý)

## 2. Dành cho Khách Hàng đặt món:
Tài khoản này mô phỏng người dùng mua hàng. Không thấy được Tab Quản lý mà chỉ thấy Giỏ Hàng và Lịch Sử Mua Hàng.

* **Khách VIP (Vừa tạo)**
  * Username: `hehe`
  * Password: *(Mật khẩu bạn tự đặt lúc đăng ký nãy giờ nhé)*
  * Chức vụ: Khách hàng

* **Khách Test 1**
  * Username: `khangg5`
  * Password: `123`
  * Chức vụ: Khách hàng

* **Khách Hàng Ngẫu Nhiên (System Demo)**
  * Username: `khtest_db`
  * Password: `123`
  * Chức vụ: Khách hàng *(Tài khoản này chứa sẵn 4 đơn mẫu để Test Quản lý)*

---
*Lưu ý: Mật khẩu thật trong Database (PostgreSQL) đã bị mã hoá một chiều siêu bảo mật bởi cơ chế `bcrypt` rồi nhé! Dù ai có hack được DB cũng không đổi ra được chuỗi `123` chữ nguyên gốc đâu.*
