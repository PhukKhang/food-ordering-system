import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // TÍNH NĂNG TÌM KIẾM & LỌC
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState("ALL"); // Giá trị: ALL, UNDER_50K, 50K_100K, OVER_100K
    const [selectedCategory, setSelectedCategory] = useState(null); // null = Tất cả

    useEffect(() => {
        fetch("http://localhost:8000/products/")
            .then(res => res.json())
            .then(data => setFoods(data))
            .catch(err => console.error("Lỗi khi tải dữ liệu:", err));

        fetch("http://localhost:8000/categories/")
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(err => console.error("Lỗi khi tải danh mục:", err));
    }, []);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Logic Lọc (Chạy mỗi khi searchTerm, priceRange hoặc selectedCategory thay đổi)
    const filteredFoods = foods.filter((food) => {
        // 1. Phù hợp Tên món
        const matchName = food.tenMon.toLowerCase().includes(searchTerm.toLowerCase());
        
        // 2. Phù hợp Khoảng giá
        let matchPrice = true;
        if (priceRange === "UNDER_50K") matchPrice = food.giaTien < 50000;
        else if (priceRange === "50K_100K") matchPrice = (food.giaTien >= 50000 && food.giaTien <= 100000);
        else if (priceRange === "OVER_100K") matchPrice = food.giaTien > 100000;

        // 3. Phù hợp Danh mục
        const matchCategory = selectedCategory === null || food.maDanhMuc === selectedCategory;

        return matchName && matchPrice && matchCategory;
    });
    
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
        const user = sessionStorage.getItem("user");
        if (!user) {
            showNotification("Vui lòng đăng nhập trước khi mua hàng!", "error");
            // Đợi 1.5 giây cho thông báo biến mất tự nhiên rồi mới chuyển trang
            setTimeout(() => navigate("/login"), 1500); 
            return;
        }

        if (monAn.conHang === false) {
            showNotification(`Rất tiếc! Món ${monAn.tenMon} hiện tại đã hết hàng.`, "error");
            return;
        }

        addToCart(monAn);
        showNotification(`Đã thêm ${monAn.tenMon} vào giỏ hàng!`, "success");
    };



    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px", fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap');
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
            <h1 style={{ textAlign: "center", color: "#FF5722", marginBottom: "30px", fontSize: "32px", fontWeight: "900" }}>KHÁM PHÁ THỰC ĐƠN</h1>

            {/* THANH TÌM KIẾM & BỘ LỌC CẢI TIẾN */}
            <div style={{ marginBottom: "40px" }}>
                {/* Search Bar - Big, centered */}
                <div style={{ 
                    maxWidth: "650px", margin: "0 auto 30px auto", position: "relative" 
                }}>
                    <input 
                        type="text" 
                        placeholder="Bạn đang thèm món gì? Gõ vào đây để tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: "100%", padding: "20px 25px", paddingLeft: "65px", 
                            borderRadius: "50px", border: "none", fontSize: "16px", 
                            outline: "none", boxSizing: "border-box", 
                            backgroundColor: "#fff", boxShadow: "0 8px 30px rgba(255, 87, 34, 0.12)",
                            transition: "0.3s", color: "#333", fontWeight: "600"
                        }}
                        onFocus={(e) => e.target.style.boxShadow = "0 12px 35px rgba(255, 87, 34, 0.2)"}
                        onBlur={(e) => e.target.style.boxShadow = "0 8px 30px rgba(255, 87, 34, 0.12)"}
                    />
                    <span style={{ position: "absolute", left: "25px", top: "50%", transform: "translateY(-50%)", fontSize: "24px" }}>
                        🔍
                    </span>
                </div>

                {/* Filter section container */}
                <div style={{ 
                    backgroundColor: "#fff", padding: "30px", borderRadius: "20px", 
                    boxShadow: "0 10px 40px rgba(0,0,0,0.06)", border: "1px solid #f5f5f5" 
                }}>
                    {/* Categories */}
                    {categories.length > 0 && (
                        <div style={{ marginBottom: "25px" }}>
                            <h3 style={{ margin: "0 0 15px 0", fontSize: "17px", color: "#333", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                                <span style={{ color: "#FF5722", fontSize: "20px" }}>🏷️</span> Danh Mục Nổi Bật
                            </h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    style={{
                                        padding: "10px 22px", borderRadius: "30px", border: "none",
                                        background: selectedCategory === null ? "linear-gradient(135deg, #FF5722, #FF9800)" : "#f0f2f5",
                                        color: selectedCategory === null ? "white" : "#444",
                                        cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "all 0.3s ease",
                                        boxShadow: selectedCategory === null ? "0 6px 15px rgba(255,87,34,0.35)" : "none"
                                    }}
                                    onMouseOver={(e) => selectedCategory !== null && (e.target.style.background = "#e4e6e9")}
                                    onMouseOut={(e) => selectedCategory !== null && (e.target.style.background = "#f0f2f5")}
                                >
                                    🌟 Tất cả
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.maDanhMuc}
                                        onClick={() => setSelectedCategory(
                                            selectedCategory === cat.maDanhMuc ? null : cat.maDanhMuc
                                        )}
                                        style={{
                                            padding: "10px 22px", borderRadius: "30px", border: "none",
                                            background: selectedCategory === cat.maDanhMuc ? "linear-gradient(135deg, #FF5722, #FF9800)" : "#f0f2f5",
                                            color: selectedCategory === cat.maDanhMuc ? "white" : "#444",
                                            cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "all 0.3s ease",
                                            boxShadow: selectedCategory === cat.maDanhMuc ? "0 6px 15px rgba(255,87,34,0.35)" : "none"
                                        }}
                                        onMouseOver={(e) => selectedCategory !== cat.maDanhMuc && (e.target.style.background = "#e4e6e9")}
                                        onMouseOut={(e) => selectedCategory !== cat.maDanhMuc && (e.target.style.background = "#f0f2f5")}
                                    >
                                        {cat.tenDanhMuc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price Divider */}
                    {categories.length > 0 && <div style={{ height: "1px", background: "#f0f0f0", margin: "0 0 25px 0" }}></div>}

                    {/* Price Range */}
                    <div>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: "17px", color: "#333", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                            <span style={{ color: "#4CAF50", fontSize: "20px" }}>💰</span> Lọc Theo Mức Giá
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                            {[
                                { val: "ALL", label: "Tất cả giá" },
                                { val: "UNDER_50K", label: "Dưới 50.000 đ" },
                                { val: "50K_100K", label: "Từ 50K - 100K" },
                                { val: "OVER_100K", label: "Trên 100.000 đ" }
                            ].map(priceItem => (
                                <button 
                                    key={priceItem.val}
                                    onClick={() => setPriceRange(priceItem.val)} 
                                    style={{ 
                                        padding: "10px 22px", borderRadius: "10px", 
                                        border: priceRange === priceItem.val ? "2px solid #4CAF50" : "1px solid #ddd", 
                                        background: priceRange === priceItem.val ? "#E8F5E9" : "#fff", 
                                        color: priceRange === priceItem.val ? "#2E7D32" : "#666", 
                                        cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "all 0.2s ease",
                                        boxShadow: priceRange === priceItem.val ? "0 4px 12px rgba(76,175,80,0.2)" : "0 2px 5px rgba(0,0,0,0.02)"
                                    }}
                                    onMouseOver={(e) => priceRange !== priceItem.val && (e.target.style.borderColor = "#bbb")}
                                    onMouseOut={(e) => priceRange !== priceItem.val && (e.target.style.borderColor = "#ddd")}
                                >
                                    {priceItem.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Check nếu kết quả rỗng */}
            {filteredFoods.length === 0 && foods.length > 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontSize: "60px", margin: "0 0 15px 0" }}>🕵️‍♂️</p>
                    <h3 style={{ color: "#444", fontSize: "22px", margin: "0 0 10px 0" }}>Không có món nào lọt vào tấm ngắm của bạn!</h3>
                    <p style={{ color: "#777", fontSize: "16px" }}>Hãy thử nhập từ khóa ngắn hơn hoặc chọn lại khoảng Giá nhé.</p>
                    <button onClick={() => {setSearchTerm(""); setPriceRange("ALL"); setSelectedCategory(null);}} style={{ marginTop: "25px", padding: "12px 25px", background: "#FF5722", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px", transition: "0.2s" }}>
                        Xoá trắng Bộ Lọc
                    </button>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "30px"
                }}>

                    {/* Vòng lặp map trên mảng ĐÃ ĐƯỢC LỌC */}
                    {filteredFoods.map((food) => (
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
                                        backgroundColor: food.conHang === false ? "#9E9E9E" : "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        fontWeight: "bold",
                                        cursor: food.conHang === false ? "not-allowed" : "pointer"
                                    }}
                                >
                                    {food.conHang === false ? "Hết hàng" : "Mua ngay"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                </div>
            )}
        </div>
    );
}