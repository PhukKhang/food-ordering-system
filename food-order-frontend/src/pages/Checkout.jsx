import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

export default function Checkout() {
    const { cart, tongTien, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        hoTen: "",
        soDienThoai: "",
        diaChi: "",
        ghiChu: ""
    });

    const [phuongThucTT, setPhuongThucTT] = useState("cod");

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
                <h2 style={{ color: "#333" }}>Giỏ hàng của bạn đang trống</h2>
                <Link to="/" style={{ display: "inline-block", marginTop: "20px", padding: "10px 20px", backgroundColor: "#FF5722", color: "white", textDecoration: "none", borderRadius: "5px", fontWeight: "bold" }}>
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        const userStr = sessionStorage.getItem("user");
        if (!userStr) {
            toast.warning("Vui lòng đăng nhập để thanh toán!");
            navigate("/login");
            return;
        }
        const user = JSON.parse(userStr);

        try {
            const response = await fetch("http://localhost:8000/orders/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.userId,
                    diaChiGiaoHang: formData.diaChi,
                    soDienThoaiNhan: formData.soDienThoai,
                    ghiChu: formData.ghiChu || ""
                })
            });
            
            if (response.ok) {
                // Clear state local content since DB is clean
                if(clearCart) clearCart();
                // Chuyển sang trang báo Thành công
                navigate("/success");
            } else {
                const data = await response.json();
                toast.error(data.detail || "Lỗi thanh toán!");
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            toast.error("Lỗi kết nối máy chủ đặt hàng");
        }
    };

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#FF5722", textAlign: "center", marginBottom: "30px" }}>Thanh Toán Đơn Hàng</h1>

            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Cột trái: Form thông tin KH */}
                <div style={{ flex: "1 1 550px", backgroundColor: "#f9f9f9", padding: "30px", borderRadius: "12px" }}>
                    <h2 style={{ borderBottom: "2px solid #ddd", paddingBottom: "10px", marginBottom: "25px", fontSize: "20px", color: "#333" }}>Thông tin giao hàng</h2>
                    <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Họ và tên *</label>
                            <input
                                type="text"
                                name="hoTen"
                                value={formData.hoTen}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px" }}
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Số điện thoại *</label>
                            <input
                                type="tel"
                                name="soDienThoai"
                                value={formData.soDienThoai}
                                onChange={handleChange}
                                required
                                pattern="^0[0-9]{9}$"
                                title="Số điện thoại của bạn chưa đúng định dạng"
                                onInvalid={(e) => {
                                    if (e.target.validity.valueMissing) {
                                        e.target.setCustomValidity("Vui lòng điền trường này");
                                    } else if (e.target.validity.patternMismatch) {
                                        e.target.setCustomValidity("Số điện thoại của bạn chưa đúng định dạng");
                                    }
                                }}
                                onInput={(e) => {
                                    e.target.setCustomValidity("");
                                }}
                                style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px" }}
                                placeholder="VD: 0901234567"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Địa chỉ nhận hàng *</label>
                            <input
                                type="text"
                                name="diaChi"
                                value={formData.diaChi}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px" }}
                                placeholder="VD: 123 Đường ABC, Quận X"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Ghi chú (Tùy chọn)</label>
                            <textarea
                                name="ghiChu"
                                value={formData.ghiChu}
                                onChange={handleChange}
                                rows="3"
                                style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", fontSize: "16px", resize: "vertical" }}
                                placeholder="VD: Lấy nhiều tương ớt, giao lúc 12h..."
                            ></textarea>
                        </div>

                        <h2 style={{ borderBottom: "2px solid #ddd", paddingBottom: "10px", margin: "20px 0 10px 0", fontSize: "20px", color: "#333" }}>Phương thức thanh toán</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "15px", border: phuongThucTT === "cod" ? "2px solid #4CAF50" : "1px solid #ddd", borderRadius: "8px", background: phuongThucTT === "cod" ? "#f1f8e9" : "#fff", transition: "0.2s" }}>
                                <input
                                    type="radio"
                                    name="phuongThucTT"
                                    value="cod"
                                    checked={phuongThucTT === "cod"}
                                    onChange={() => setPhuongThucTT("cod")}
                                    style={{ width: "20px", height: "20px" }}
                                />
                                <span style={{ fontWeight: phuongThucTT === "cod" ? "bold" : "normal", fontSize: "16px" }}>Thanh toán khi nhận hàng (COD)</span>
                            </label>

                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "15px", border: phuongThucTT === "bank" ? "2px solid #4CAF50" : "1px solid #ddd", borderRadius: "8px", background: phuongThucTT === "bank" ? "#f1f8e9" : "#fff", transition: "0.2s" }}>
                                <input
                                    type="radio"
                                    name="phuongThucTT"
                                    value="bank"
                                    checked={phuongThucTT === "bank"}
                                    onChange={() => setPhuongThucTT("bank")}
                                    style={{ width: "20px", height: "20px" }}
                                />
                                <span style={{ fontWeight: phuongThucTT === "bank" ? "bold" : "normal", fontSize: "16px" }}>Chuyển khoản (Ngân hàng / Momo)</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: "30px",
                                padding: "18px",
                                backgroundColor: "#FF5722",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "18px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(255, 87, 34, 0.3)",
                                transition: "0.3s"
                            }}
                        >
                            XÁC NHẬN ĐẶT HÀNG
                        </button>
                    </form>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div style={{ flex: "1 1 350px", backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", position: "sticky", top: "20px" }}>
                    <h2 style={{ borderBottom: "2px solid #ddd", paddingBottom: "10px", marginBottom: "25px", fontSize: "20px", color: "#333" }}>Tóm tắt đơn hàng</h2>

                    <div style={{ maxHeight: "350px", overflowY: "auto", marginBottom: "20px", paddingRight: "5px" }}>
                        {cart.map((item, index) => (
                            <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px dashed #eee", paddingBottom: "15px" }}>
                                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                                    <div style={{ minWidth: "35px", height: "35px", backgroundColor: "#f5f5f5", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "6px", fontWeight: "bold", fontSize: "14px", color: "#555" }}>
                                        {item.soLuong}x
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>{item.tenMon}</span>
                                        <span style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{item.giaTien.toLocaleString('vi-VN')} đ/phần</span>
                                    </div>
                                </div>
                                <span style={{ fontWeight: "bold", color: "#333", fontSize: "15px" }}>{(item.giaTien * item.soLuong).toLocaleString('vi-VN')} đ</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
                        <span style={{ fontSize: "16px", color: "#666" }}>Tạm tính:</span>
                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>{tongTien.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                        <span style={{ fontSize: "16px", color: "#666" }}>Phí giao hàng:</span>
                        <span style={{ fontWeight: "bold", fontSize: "16px" }}>15.000 đ</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px", paddingTop: "20px", borderTop: "2px dashed #ccc" }}>
                        <span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Tổng cộng:</span>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#FF5722" }}>{(tongTien + 15000).toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
