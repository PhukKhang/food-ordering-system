import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function OrderSuccess() {
    const { clearCart } = useCart();
    
    // Gọi hàm clearCart lúc render component để xoá giỏ hàng
    useEffect(() => {
        clearCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Random mã đơn hàng
    const mockOrderId = "FO" + Math.floor(100000 + Math.random() * 900000);

    return (
        <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", fontFamily: "sans-serif", padding: "50px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ 
                width: "90px", 
                height: "90px", 
                backgroundColor: "#4CAF50", 
                borderRadius: "50%", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                margin: "0 auto 25px",
                boxShadow: "0 4px 15px rgba(76, 175, 80, 0.4)"
            }}>
                <span style={{ color: "white", fontSize: "45px", fontWeight: "bold" }}>✓</span>
            </div>
            
            <h1 style={{ color: "#333", marginBottom: "15px", fontSize: "28px" }}>Đặt hàng thành công!</h1>
            <p style={{ color: "#555", fontSize: "16px", marginBottom: "35px", lineHeight: "1.6" }}>
                Cảm ơn bạn đã đặt hàng tại hệ thống của chúng tôi.<br/>
                Mã đơn hàng của bạn là: <br/> 
                <strong style={{ color: "#FF5722", fontSize: "22px", display: "inline-block", marginTop: "10px", padding: "8px 20px", background: "#fff3f0", borderRadius: "8px" }}>
                    #{mockOrderId}
                </strong>
            </p>
            
            <div style={{ backgroundColor: "#f9f9f9", padding: "25px", borderRadius: "10px", marginBottom: "35px", textAlign: "left", borderLeft: "4px solid #FF5722" }}>
                <p style={{ margin: "0 0 10px 0", color: "#333", fontWeight: "bold", fontSize: "16px" }}>📌 Lưu ý:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ margin: "0", color: "#666", fontSize: "15px" }}>• Nhân viên cửa hàng sẽ liên hệ với bạn trong ít phút để xác nhận đơn hàng.</p>
                    <p style={{ margin: "0", color: "#666", fontSize: "15px" }}>• Vui lòng chú ý điện thoại để shipper có thể giao hàng thuận lợi.</p>
                    <p style={{ margin: "0", color: "#666", fontSize: "15px" }}>• Chuẩn bị sẵn số tiền thanh toán khi nhận hàng nếu bạn chọn COD.</p>
                </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Link to="/" style={{ 
                    padding: "15px 35px", 
                    backgroundColor: "#FF5722", 
                    color: "white", 
                    textDecoration: "none", 
                    borderRadius: "8px", 
                    fontWeight: "bold", 
                    fontSize: "16px",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 10px rgba(255, 87, 34, 0.3)"
                }}>
                    Tiếp tục mua sắm
                </Link>
            </div>
        </div>
    );
}
