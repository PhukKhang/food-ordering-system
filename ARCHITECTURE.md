# System Architecture: Food Ordering System

Tài liệu này mô tả kiến trúc tổng thể của hệ thống Đặt Đồ Ăn (Food Ordering System). Hệ thống được thiết kế theo mô hình Client-Server với sự phân tách rõ ràng giữa Frontend (React) và Backend (FastAPI), đi kèm hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL.

---

## 1. High-Level Architecture (Kiến trúc Tổng thể)

Luồng hoạt động chính bao gồm Người dùng (Khách hàng hoặc Quản trị viên) tương tác với Giao diện Web (Frontend). Giao diện gửi các yêu cầu HTTP thông qua API đến Máy chủ (Backend), nơi xử lý nghiệp vụ logic và đọc/ghi dữ liệu vào Hệ Quản trị Cơ sở dữ liệu (PostgreSQL).

```mermaid
graph TD
    A[Người Dùng \n Browser] -->|HTTP / REST API| B(Frontend \n React.js / Vite)
    B -->|Fetch AJAX \n JSON| C(Backend API \n FastAPI / Python)
    C -->|SQLAlchemy ORM \n TCP| D[(Database \n PostgreSQL)]
    
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef web fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px;
    classDef api fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#4caf50,stroke-width:2px;
    
    class A client;
    class B web;
    class C api;
    class D db;
```

---

## 2. Frontend Architecture (React.js)

Kiến trúc phần giao diện được tổ chức theo cấu trúc Single Page Application (SPA), sử dụng **Context API** làm trung tâm lưu trữ State cục bộ giúp luân chuyển dữ liệu xuyên suốt các trang.

- **Routing:** Quản lý bằng `react-router-dom` giúp việc chuyển trang không cần reset tải lại toàn bộ tài nguyên.
- **State Management:**
  - `AuthContext`: Quản lý tình trạng đăng nhập, thông tin `user` hiện tại và xử lý phân quyền (RBAC).
  - `CartContext`: Quản lý logic Giỏ hàng và đồng bộ tổng tiền trước khi ra quyết định Thanh Toán (Checkout).
- **Libraries:** Sử dụng CSS Inline kết hợp thư viện `react-toastify` để cung cấp phản hồi thông báo UI độc lập. Dữ liệu báo cáo trên Admin được biểu đồ hóa thông qua `recharts` và xuất nhờ thư viện `xlsx`.

```mermaid
graph TD
    subgraph Frontend [React Application]
        Router[React Router]
        Router --> Home[Home Page \n Khám phá Thực đơn]
        Router --> Login[Login / Register \n Xác thực]
        Router --> Cart[Cart & Checkout \n Giao dịch]
        Router --> Admin[Dashboard \n Quản trị RBAC]
        
        subgraph Context [Global State]
            AuthCtx(AuthContext \n Phân quyền)
            CartCtx(CartContext \n Giỏ hàng)
        end
        
        Home -.-> CartCtx
        Cart -.-> CartCtx
        Admin -.-> AuthCtx
        Login -.-> AuthCtx
    end
    
    Frontend <-->|API Calls| BE((Backend Server))
```

---

## 3. Backend Architecture (FastAPI)

Ứng dụng backend được tổ chức theo hình thức Module hóa mạnh (thông qua `APIRouter`), tập trung vào luồng xử lý REST. Mỗi endpoint được khai báo rõ ràng phương thức, schema đầu vào/đầu ra và bảo vệ tính toàn vẹn (Validation) thông qua thư viện `Pydantic`.

- **Core/Server:** Môi trường ảo chứa ứng dụng chạy trên `Uvicorn` server xử lý đa luồng ASGI bất đồng bộ chuyên nghiệp. 
- **Routers:**
  - `auth.py`: Xử lý phân giải Token JWT (đã nâng cấp mock tại FE) và tạo User.
  - `category.py`: CRUD dữ liệu liên quan đến Danh mục.
  - `product.py`: CRUD quản lý Sản phẩm/Thực đơn, xử lý tệp tĩnh (Tải ảnh Upload).
  - `order.py`: Xử lý tạo và thay đổi chu kỳ hoàn tất tiến trình đơn hàng (Pipeline Trạng thái).
- **Data Layer:** 
  - `database.py`: Quản lý chuỗi kết nối và tạo Engine giao tiếp tới `PostgreSQL`.
  - `models.py`: Khai báo bảng lược đồ tương tác.
  - `schemas.py`: Định nghĩa các cấu trúc JSON (Pydantic model) ra/vào API.

```mermaid
graph LR
    subgraph Request Pipeline
        Req[HTTP Request] --> Middleware[CORS & Auth Middleware]
        Middleware --> Router[API Router]
        Router --> Services[Business Logic]
        Services --> ORM[SQLAlchemy ORM]
    end
    
    ORM --> DB[(PostgreSQL)]
```

---

## 4. Entity Relationship Diagram (ERD Lược đồ Dữ liệu)

Chi tiết cấu trúc mô hình (Schema) và mối liên kết quan hệ 1-Nhiều hoặc Nhiều-Nhiều bên trong thiết kế SQL của hệ thống.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "Places"
    USERS ||--o{ CART : "Owns"
    CATEGORIES ||--o{ PRODUCTS : "Contains"
    ORDERS ||--|{ ORDER_DETAILS : "Has"
    PRODUCTS }o--|{ ORDER_DETAILS : "Included in"
    PRODUCTS }o--|{ CART : "Stored in"

    USERS {
        int maUser PK
        string username
        string password
        string hoTen
        string role "ADMIN / STAFF / CUSTOMER"
    }
    
    PRODUCTS {
        int maMon PK
        string tenMon
        float giaTien
        string hinhAnh
        string moTa
        boolean conHang
        boolean daXoa "Soft Delete"
        int maDanhMuc FK
    }

    CATEGORIES {
        int maDanhMuc PK
        string tenDanhMuc
        string moTa
    }

    ORDERS {
        int id PK
        string khachHang
        string sdt
        float tongTien
        string trangThai "pending/delivering/completed"
        int idKhachHang FK
    }

    ORDER_DETAILS {
        int id PK
        int maDon FK
        int maMon FK
        int soLuong
        float donGia
    }
```

---

## 5. Security & Deployment Focus

1. **Authentication:** 
   - Backend sử dụng JWT (JSON Web Tokens) đính kèm trên Authorization Bearer Headers để xử lý bảo mật phía Server API.
   - Các mật khẩu được dùng thuật toán một chiều `bcrypt` để tạo hash salt bảo vệ Dữ liệu mật trong DB.
2. **Soft Delete Concept:**
   - Hệ thống được trang bị "Thùng Rác" với cờ cắm `daXoa = True` cho món ăn. Điều này đảm bảo lịch sử báo cáo dòng tiền ở quá khứ không bị lệch lệch nhịp (data consistency cascade rule) nếu vô tình xóa mất một món ăn vĩnh viễn khỏi Database.
3. **Mô hình Khởi Chạy (Deployment):**
   - Đã được chuẩn bị sẵn các Port như `8000` (FastAPI) và `5173` (Vite dev server) thông suốt qua cấu hình CORS từ Backend. Có thể đóng gói thông qua Docker hoặc Publish lên nền tảng như Render/Vercel dễ dàng.
