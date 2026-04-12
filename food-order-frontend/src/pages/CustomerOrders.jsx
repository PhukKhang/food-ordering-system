import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CustomerOrders() {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("current"); // "current", "history", "cancelled"
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = () => {
        const userStr = sessionStorage.getItem("user");
        if (!userStr) {
            navigate("/login");
            return;
        }
        const user = JSON.parse(userStr);
        setLoading(true);
        fetch(`http://localhost:8000/orders/history/${user.userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.error("API trả về lỗi hoặc không phải mảng:", data);
                    setOrders([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi:", err);
                setLoading(false);
                setOrders([]);
            });
    };

    const executeCancel = () => {
        if (!confirmCancel) return;
        const userStr = sessionStorage.getItem("user");
        const token = userStr ? JSON.parse(userStr).token : "";
        fetch(`http://localhost:8000/orders/${confirmCancel}/cancel`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.ok) {
                fetchOrders();
            }
            setConfirmCancel(null);
        })
        .catch(err => {
            console.error(err);
            setConfirmCancel(null);
        });
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    // Phân loại đơn an toàn đề phòng orders null/undefined
    const safeOrders = Array.isArray(orders) ? orders : [];
    const currentOrders = safeOrders.filter(o => o.trangThai !== "completed" && o.trangThai !== "cancelled");
    const historyOrders = safeOrders.filter(o => o.trangThai === "completed");
    const cancelledOrders = safeOrders.filter(o => o.trangThai === "cancelled");
    
    // Đơn để hiển thị theo Tab
    const displayOrders = activeTab === "current" ? currentOrders : (activeTab === "history" ? historyOrders : cancelledOrders);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1 style={{ color: "#FF5722", margin: 0 }}>Quản Lý Đơn Hàng</h1>
                <button 
                    onClick={fetchOrders} 
                    disabled={loading}
                    style={{ 
                        padding: "10px 15px", 
                        background: loading ? "#ccc" : "#4CAF50", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        transition: "0.2s"
                    }}
                >
                    {loading ? "⏳ Đang tải..." : "🔄 Làm mới Đơn Mới Nhất"}
                </button>
            </div>
            
            {/* Nút Tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
                <button 
                    onClick={() => setActiveTab("current")}
                    style={{
                        padding: "10px 20px",
                        background: activeTab === "current" ? "#FF5722" : "transparent",
                        color: activeTab === "current" ? "white" : "#555",
                        border: "none",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "16px",
                        transition: "0.3s"
                    }}
                >
                    Đơn Đang Giao ({currentOrders.length})
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    style={{
                        padding: "10px 20px",
                        background: activeTab === "history" ? "#4CAF50" : "transparent",
                        color: activeTab === "history" ? "white" : "#555",
                        border: "none",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "16px",
                        transition: "0.3s"
                    }}
                >
                    Đã Giao Gần Đây ({historyOrders.length})
                </button>
                <button 
                    onClick={() => setActiveTab("cancelled")}
                    style={{
                        padding: "10px 20px",
                        background: activeTab === "cancelled" ? "#9E9E9E" : "transparent",
                        color: activeTab === "cancelled" ? "white" : "#555",
                        border: "none",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "16px",
                        transition: "0.3s"
                    }}
                >
                    Món Đã Hủy ({cancelledOrders.length})
                </button>
            </div>

            {displayOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", background: "#f9f9f9", borderRadius: "10px" }}>
                    <p style={{ fontSize: "18px", color: "#666" }}>
                        {activeTab === "current" ? "Bạn không có đơn hàng nào đang chờ." : (activeTab === "history" ? "Bạn chưa mua hàng lần nào." : "Không có đơn hàng nào bị hủy.")}
                    </p>
                    <Link to="/" style={{ display: "inline-block", marginTop: "15px", padding: "10px 20px", background: "#FF5722", color: "white", textDecoration: "none", borderRadius: "5px" }}>Đi dạo thực đơn ngay</Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {displayOrders.map(order => (
                        <div key={order.id} style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "25px", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", paddingBottom: "15px", marginBottom: "20px" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>Mã Vận Đơn #{order.id}</h3>
                                    <span style={{ color: "#777", fontSize: "14px" }}>Ngày thao tác: {order.ngayDat}</span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ 
                                        display: "inline-block", 
                                        padding: "8px 15px", 
                                        borderRadius: "20px", 
                                        background: order.trangThai === "completed" ? "#E8F5E9" : order.trangThai === "cancelled" ? "#FFEBEE" : "#FFF3E0", 
                                        color: order.trangThai === "completed" ? "#2E7D32" : order.trangThai === "cancelled" ? "#C62828" : "#E65100", 
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                    }}>
                                        {order.trangThai === "pending" && "⏳ Đang Chờ Duyệt"}
                                        {order.trangThai === "confirmed" && "📝 Quán Đã Nhận Đơn"}
                                        {order.trangThai === "preparing" && "👨‍🍳 Quán Đang Nấu Món"}
                                        {order.trangThai === "delivering" && "🛵 Shipper Đang Giao"}
                                        {order.trangThai === "completed" && "✅ Giao Thành Công"}
                                        {order.trangThai === "cancelled" && "❌ Đơn Bị Hủy"}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {order.danhSachMon.map((mon, index) => (
                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <img src={mon.hinhAnh} style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} alt={mon.tenMon} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: "0", fontWeight: "bold", fontSize: "16px", color: "#333" }}>{mon.tenMon}</p>
                                            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>{mon.soLuong} phần</p>
                                        </div>
                                        <div style={{ fontWeight: "bold", color: "#333", fontSize: "16px" }}>
                                            {(mon.soLuong * mon.giaTien).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ color: "#555", fontSize: "14px", background: "#f9f9f9", padding: "10px 15px", borderRadius: "8px", maxWidth: "60%" }}>
                                    <p style={{ margin: "0" }}><strong>Giao đến:</strong> {order.diaChiGiaoHang}</p>
                                    {order.ghiChu && <p style={{ margin: "5px 0 0 0" }}><strong>Ghi chú:</strong> {order.ghiChu}</p>}
                                </div>
                                <div style={{ fontSize: "18px", textAlign: "right" }}>
                                    Tổng thanh toán:<br/>
                                    <span style={{ fontWeight: "bold", color: "#E91E63", fontSize: "24px" }}>{order.tongTien.toLocaleString('vi-VN')} đ</span>
                                    
                                    {(order.trangThai === "pending" || order.trangThai === "confirmed") && (
                                        <div style={{ marginTop: "15px" }}>
                                            <button 
                                                onClick={() => setConfirmCancel(order.id)}
                                                style={{ padding: "8px 20px", backgroundColor: "#fff", color: "#F44336", border: "1px solid #ffcdd2", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                                                onMouseOver={(e) => {e.target.style.backgroundColor = "#ffebee"; e.target.style.borderColor= "#f44336"}}
                                                onMouseOut={(e) => {e.target.style.backgroundColor = "#fff"; e.target.style.borderColor = "#ffcdd2"}}
                                            >
                                                ❌ Hủy Đơn Này
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Xác Nhận Hủy */}
            {confirmCancel && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", maxWidth: "400px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Xác nhận hủy đơn hàng này?</h3>
                        <p style={{ color: "#666", marginBottom: "25px", fontSize: "15px", lineHeight: "1.5" }}>Hành động này không thể hoàn tác. Chắc chắn muốn hủy đơn hàng #{confirmCancel} chứ?</p>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button onClick={() => setConfirmCancel(null)} style={{ padding: "10px 20px", border: "1px solid #ccc", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#555" }}>
                                Không, Giữ Lại
                            </button>
                            <button onClick={executeCancel} style={{ padding: "10px 20px", border: "none", backgroundColor: "#F44336", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                Vâng, Hủy Luôn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
