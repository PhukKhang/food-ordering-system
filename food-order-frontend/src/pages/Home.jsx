import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// 1. Dữ liệu giả lập khớp với cấu trúc bảng MonAn trong Database
const dummyFoods = [
    {
        maMon: 1,
        tenMon: "Gà Rán Giòn Cay",
        giaTien: 45000,
        hinhAnh: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
        moTa: "Gà rán chuẩn vị, giòn rụm bên ngoài, mọng nước bên trong.",
        trangThai: "available"
    },
    {
        maMon: 2,
        tenMon: "Burger Bò Úc Phô Mai",
        giaTien: 65000,
        hinhAnh: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
        moTa: "Thịt bò nướng lửa hồng kết hợp cùng phô mai Cheddar chảy.",
        trangThai: "available"
    },
    {
        maMon: 3,
        tenMon: "Pizza Hải Sản (Size L)",
        giaTien: 159000,
        hinhAnh: "https://images.unsplash.com/photo-1513104890d38-7c0f4fff45f1?auto=format&fit=crop&w=400&q=80",
        moTa: "Pizza đế mỏng nướng củi, ngập tràn tôm, mực và phô mai Mozzarella.",
        trangThai: "out_of_stock" // Món này đang hết hàng để test logic
    },
    {
        maMon: 4,
        tenMon: "Trà Đào Cam Sả",
        giaTien: 35000,
        hinhAnh: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80",
        moTa: "Giải nhiệt mùa hè cực đã với những miếng đào giòn sần sật.",
        trangThai: "available"
    }
];

export default function Home() {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    
    // Tạo state lưu trữ thông báo
    const [notification, setNotification] = useState(null);

    // Hàm gọi hiển thị thông báo
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        // Tự động ẩn sau 2 giây
        setTimeout(() => {
            setNotification(null);
        }, 2000);
    };

    const handleAddToCart = (monAn) => {
        // Kiểm tra xem đã đăng nhập chưa
        const user = localStorage.getItem("user");
        if (!user) {
            showNotification("Vui lòng đăng nhập trước khi mua hàng!", "error");
            // Đợi 1.5 giây cho thông báo biến mất tự nhiên rồi mới chuyển trang
            setTimeout(() => navigate("/login"), 1500); 
            return;
        }

        if (monAn.trangThai === "out_of_stock") {
            showNotification(`Rất tiếc! Món ${monAn.tenMon} hiện tại đã hết hàng.`, "error");
            return;
        }

        addToCart(monAn);
        showNotification(`Đã thêm ${monAn.tenMon} vào giỏ hàng!`, "success");
    };



    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
            <style>
                {`
                    @keyframes fadeInCenter {
                        from { opacity: 0; transform: translate(-50%, -60%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                `}
            </style>

            {/* Component thông báo ở giữa màn hình */}
            {notification && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: notification.type === "error" ? "#f44336" : "#4CAF50",
                    color: "white",
                    padding: "20px 40px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    zIndex: 9999,
                    fontWeight: "bold",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    animation: "fadeInCenter 0.3s ease-out"
                }}>
                    <span style={{ fontSize: "28px" }}>{notification.type === "error" ? "❌" : "✅"}</span>
                    {notification.message}
                </div>
            )}
            <h1 style={{ textAlign: "center", color: "#FF5722", marginBottom: "40px" }}>Menu Của Nhà Hàng</h1>

            {/* Khung chứa dạng Lưới (Grid) để xếp các món ăn cạnh nhau */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "25px"
            }}>

                {/* 3. Dùng vòng lặp .map() để in từng món ăn ra màn hình */}
                {dummyFoods.map((food) => (
                    <div key={food.maMon} style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        backgroundColor: "#fff"
                    }}>
                        {/* Hình ảnh món ăn */}
                        <img
                            src={food.hinhAnh}
                            alt={food.tenMon}
                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        />

                        {/* Thông tin món ăn */}
                        <div style={{ padding: "15px" }}>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#333" }}>{food.tenMon}</h3>
                            <p style={{ color: "#777", fontSize: "14px", lineHeight: "1.5", height: "42px", overflow: "hidden", margin: "0 0 15px 0" }}>
                                {food.moTa}
                            </p>

                            {/* Khu vực Giá tiền và Nút bấm */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {/* Dùng hàm toLocaleString() để format tiền: 45000 -> 45.000 */}
                                <span style={{ fontWeight: "bold", color: "#E91E63", fontSize: "18px" }}>
                                    {food.giaTien.toLocaleString('vi-VN')} đ
                                </span>

                                <button
                                    onClick={() => handleAddToCart(food)}
                                    // Đổi màu nút thành xám nếu hết hàng
                                    style={{
                                        padding: "8px 15px",
                                        backgroundColor: food.trangThai === "out_of_stock" ? "#9E9E9E" : "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: "bold",
                                        cursor: food.trangThai === "out_of_stock" ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {food.trangThai === "out_of_stock" ? "Hết hàng" : "Mua ngay"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}