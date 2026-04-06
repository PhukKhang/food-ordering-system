import { useState } from "react";

// Dữ liệu giả lập cho Đơn Hàng (Mock Data)
const mockOrders = [
    { id: "FO412931", khachHang: "Nguyễn Văn A", sdt: "0901234567", tongTien: 125000, trangThai: "pending", thoiGian: "12:00 24/10" },
    { id: "FO134912", khachHang: "Trần Thị B", sdt: "0912345678", tongTien: 85000, trangThai: "pending", thoiGian: "12:05 24/10" },
    { id: "FO982312", khachHang: "Lê Văn C", sdt: "0923456789", tongTien: 315000, trangThai: "confirmed", thoiGian: "11:30 24/10" },
    { id: "FO102391", khachHang: "Phạm D", sdt: "0934567890", tongTien: 45000, trangThai: "delivering", thoiGian: "10:45 24/10" },
    { id: "FO882103", khachHang: "Hoàng E", sdt: "0945678901", tongTien: 590000, trangThai: "completed", thoiGian: "09:00 24/10" }
];

// Cấu hình linh tinh để tái sử dụng hiển thị & Màu sắc
const STATUS_CONFIG = {
    pending: { label: "Chờ xác nhận", color: "#FFF3CD", textColor: "#856404", next: "confirmed", prev: null, actionText: "Duyệt đơn", actionColor: "#2196F3" },
    confirmed: { label: "Đã xác nhận", color: "#CCE5FF", textColor: "#004085", next: "preparing", prev: "pending", actionText: "Bắt đầu nấu", actionColor: "#9C27B0" },
    preparing: { label: "Đang chuẩn bị", color: "#E2D9F3", textColor: "#38186D", next: "delivering", prev: "confirmed", actionText: "Giao hàng", actionColor: "#FF9800" },
    delivering: { label: "Đang giao hàng", color: "#FFF3CD", textColor: "#FF9800", next: "completed", prev: "preparing", actionText: "Khách đã nhận", actionColor: "#4CAF50" },
    completed: { label: "Hoàn tất", color: "#D4EDDA", textColor: "#155724", next: null, prev: "delivering", actionText: "Đã xong", actionColor: "#ccc" }
};

export default function Dashboard() {
    const [orders, setOrders] = useState(mockOrders);

    // Xử lý Logic chuyển Trạng thái về phía trước (Duyệt tiến)
    const handleNextStatus = (orderId, currentStatus) => {
        const nextStatus = STATUS_CONFIG[currentStatus].next;
        if (!nextStatus) return; // Nếu đã completed thì thôi không làm gì cả
        
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, trangThai: nextStatus } : order
        ));
    };

    // Xử lý lùi Trạng thái (Hoàn tác nếu lỡ bấm nhầm)
    const handlePrevStatus = (orderId, currentStatus) => {
        const prevStatus = STATUS_CONFIG[currentStatus].prev;
        if (!prevStatus) return; // Nếu đang pending thì không thể lùi được nữa
        
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, trangThai: prevStatus } : order
        ));
    };

    // Calculate metrics cho thẻ Thống kê
    const totalRevenue = orders.filter(o => o.trangThai === "completed").reduce((sum, o) => sum + o.tongTien, 0);
    const pendingCount = orders.filter(o => o.trangThai === "pending").length;
    const deliveringCount = orders.filter(o => o.trangThai === "delivering").length;

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#333", marginBottom: "30px", borderLeft: "5px solid #FF5722", paddingLeft: "15px" }}>
                Bảng Điều Khiển Quản Trị
            </h1>
            
            {/* VÙNG THỐNG KÊ (CARDS) */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #FFC107" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>⚠️</span> Đơn Chờ Xác Nhận
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#333" }}>{pendingCount}</p>
                </div>
                
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #FF9800" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>🛵</span> Đơn Đang Giao
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#333" }}>{deliveringCount}</p>
                </div>
                
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #4CAF50" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>💵</span> Doanh Thu (Hoàn tất)
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#4CAF50" }}>{totalRevenue.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* VÙNG BẢNG ĐƠN HÀNG (DATA TABLE) */}
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "20px 25px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Danh Sách Đơn Hàng Mới Nhất</h2>
                    <span style={{ fontSize: "14px", color: "#888" }}>Cập nhật tự động (Local)</span>
                </div>
                
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "15px" }}>
                                <th style={{ padding: "18px 25px", borderBottom: "2px solid #ddd", width: "120px" }}>Mã Đơn</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd" }}>Khách Hàng</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "150px" }}>Thời Gian</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "150px" }}>Tổng Tiền</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "180px" }}>Trạng Thái</th>
                                <th style={{ padding: "18px 25px", borderBottom: "2px solid #ddd", textAlign: "right", width: "150px" }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const statusInfo = STATUS_CONFIG[order.trangThai];
                                
                                return (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", transition: "0.2s" }} className="table-row-hover">
                                        <td style={{ padding: "18px 25px", fontWeight: "bold", color: "#FF5722" }}>#{order.id}</td>
                                        <td style={{ padding: "18px 20px" }}>
                                            <div style={{ fontWeight: "bold", color: "#333", marginBottom: "6px" }}>{order.khachHang}</div>
                                            <div style={{ fontSize: "14px", color: "#888" }}>Điện thoại: {order.sdt}</div>
                                        </td>
                                        <td style={{ padding: "18px 20px", color: "#666", fontSize: "15px" }}>{order.thoiGian}</td>
                                        <td style={{ padding: "18px 20px", fontWeight: "bold", color: "#333", fontSize: "16px" }}>{order.tongTien.toLocaleString('vi-VN')} đ</td>
                                        <td style={{ padding: "18px 20px" }}>
                                            {/* Thẻ Label Trạng thái (Badge) */}
                                            <span style={{ 
                                                display: "inline-block",
                                                padding: "6px 14px", 
                                                backgroundColor: statusInfo.color, 
                                                color: statusInfo.textColor,
                                                borderRadius: "20px",
                                                fontSize: "13px",
                                                fontWeight: "bold",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: "18px 25px", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                {/* Nút lùi trạng thái (Hoàn tác) */}
                                                {statusInfo.prev && (
                                                    <button 
                                                        onClick={() => handlePrevStatus(order.id, order.trangThai)}
                                                        title="Hoàn tác thao tác"
                                                        style={{
                                                            padding: "10px",
                                                            backgroundColor: "#fff",
                                                            color: "#555",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                            fontSize: "14px",
                                                            transition: "0.2s",
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                                        }}
                                                    >
                                                        ⟲
                                                    </button>
                                                )}

                                                {/* Nút bấm Hành động chuyển trạng thái */}
                                                {statusInfo.next ? (
                                                    <button 
                                                        onClick={() => handleNextStatus(order.id, order.trangThai)}
                                                        style={{
                                                            padding: "10px 18px",
                                                            backgroundColor: statusInfo.actionColor,
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                            fontSize: "14px",
                                                            transition: "0.2s",
                                                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                                            minWidth: "120px"
                                                        }}
                                                    >
                                                        {statusInfo.actionText} ➜
                                                    </button>
                                                ) : (
                                                    <span style={{ color: "#aaa", fontSize: "14px", fontWeight: "bold", fontStyle: "italic", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "38px", width: "120px" }}>
                                                        Không có HĐ
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: "16px" }}>
                                        Hệ thống không có đơn hàng nào vào lúc này.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chút CSS cho hiệu ứng Hover trên từng hàng của Bảng */}
            <style>
                {`
                    .table-row-hover:hover {
                        background-color: #f1f8e9 !important;
                    }
                    button:hover {
                        opacity: 0.85;
                        transform: translateY(-1px);
                    }
                    button:active {
                        transform: translateY(1px);
                    }
                `}
            </style>
        </div>
    );
}