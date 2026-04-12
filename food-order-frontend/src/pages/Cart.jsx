import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart, tongTien, fetchCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (fetchCart) fetchCart();
    }, [fetchCart]);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#FF5722", textAlign: "center", marginBottom: "30px" }}>Giỏ Hàng Của Bạn</h1>
            
            {cart.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: "50px", padding: "40px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                    <p style={{ fontSize: "18px", color: "#777", marginBottom: "20px" }}>Giỏ hàng đang trống.</p>
                    <Link to="/" style={{ 
                        display: "inline-block", 
                        padding: "12px 25px", 
                        backgroundColor: "#4CAF50", 
                        color: "white", 
                        textDecoration: "none", 
                        borderRadius: "6px",
                        fontWeight: "bold",
                        fontSize: "16px",
                        transition: "0.3s"
                    }}>
                        Quay lại chọn món
                    </Link>
                </div>
            ) : (
                <>
                    <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                        {cart.map((item) => (
                            <div key={item.maMon} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                borderBottom: "1px solid #f0f0f0",
                                padding: "20px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
                                    <img src={item.hinhAnh} alt={item.tenMon} style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px" }} />
                                    <div>
                                        <h3 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "18px" }}>{item.tenMon}</h3>
                                        <p style={{ margin: "0", color: "#E91E63", fontWeight: "bold", fontSize: "16px" }}>{item.giaTien.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                </div>
                                
                                <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
                                        <button 
                                            onClick={() => updateQuantity(item.maMon, -1)}
                                            style={{ border: "none", background: "#f5f5f5", padding: "8px 15px", cursor: "pointer", fontSize: "18px", color: "#555" }}
                                        >-</button>
                                        <span style={{ padding: "0 20px", fontWeight: "bold", fontSize: "16px" }}>{item.soLuong}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.maMon, 1)}
                                            style={{ border: "none", background: "#f5f5f5", padding: "8px 15px", cursor: "pointer", fontSize: "18px", color: "#555" }}
                                        >+</button>
                                    </div>
                                    
                                    <div style={{ minWidth: "120px", textAlign: "right", fontWeight: "bold", color: "#333", fontSize: "18px" }}>
                                        {(item.giaTien * item.soLuong).toLocaleString('vi-VN')} đ
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeFromCart(item.maMon)}
                                        style={{ border: "none", background: "#FFEbee", color: "#f44336", padding: "10px 15px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ 
                        marginTop: "30px", 
                        padding: "25px", 
                        backgroundColor: "#fff", 
                        borderRadius: "10px", 
                        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div>
                            <span style={{ fontSize: "18px", color: "#555" }}>Tổng thanh toán: </span>
                            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FF5722", marginLeft: "10px" }}>
                                {tongTien.toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                        
                        <div style={{ gap: "15px", display: "flex" }}>
                            <button 
                                onClick={clearCart}
                                style={{ padding: "12px 25px", backgroundColor: "#fff", color: "#555", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
                            >
                                Xóa tất cả
                            </button>
                            <button 
                                onClick={() => navigate("/checkout")}
                                style={{ padding: "12px 35px", backgroundColor: "#FF5722", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "18px", boxShadow: "0 4px 10px rgba(255, 87, 34, 0.3)" }}
                            >
                                Đặt Hàng Ngay
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
