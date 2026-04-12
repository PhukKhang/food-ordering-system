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
            <h1 style={{ textAlign: "center", color: "#FF5722", marginBottom: "30px", fontSize: "32px", fontWeight: "900" }}>KHÁM PHÁ THỰC ĐƠN</h1>

            {/* THANH TÌM KIẾM & BỘ LỌC */}
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between", border: "1px solid #f0f0f0" }}>
                
                {/* Search Bar */}
                <div style={{ flex: "1 1 300px", position: "relative" }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Bạn đang thèm món gì? Gõ vào đây..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "14px 15px", paddingLeft: "45px", borderRadius: "30px", border: "1px solid #ddd", fontSize: "16px", outline: "none", boxSizing: "border-box", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}
                        onFocus={(e) => e.target.style.borderColor = "#FF5722"}
                        onBlur={(e) => e.target.style.borderColor = "#ddd"}
                    />
                </div>

                {/* Price Filter Chips */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "5px 0" }}>
                    <span style={{ fontWeight: "bold", color: "#555", alignSelf: "center", marginRight: "10px" }}>Lọc giá:</span>
                    
                    <button onClick={() => setPriceRange("ALL")} style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #FF5722", background: priceRange === "ALL" ? "#FF5722" : "transparent", color: priceRange === "ALL" ? "white" : "#FF5722", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
                        Tất cả
                    </button>
                    <button onClick={() => setPriceRange("UNDER_50K")} style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #FF5722", background: priceRange === "UNDER_50K" ? "#FF5722" : "transparent", color: priceRange === "UNDER_50K" ? "white" : "#FF5722", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
                        Dưới 50K
                    </button>
                    <button onClick={() => setPriceRange("50K_100K")} style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #FF5722", background: priceRange === "50K_100K" ? "#FF5722" : "transparent", color: priceRange === "50K_100K" ? "white" : "#FF5722", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
                        50K - 100K
                    </button>
                    <button onClick={() => setPriceRange("OVER_100K")} style={{ padding: "8px 18px", borderRadius: "20px", border: "1px solid #FF5722", background: priceRange === "OVER_100K" ? "#FF5722" : "transparent", color: priceRange === "OVER_100K" ? "white" : "#FF5722", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"} onMouseOut={(e) => e.target.style.transform = "translateY(0)"}>
                        Trên 100K
                    </button>
                </div>
            </div>

            {/* LỌC THEO DANH MỤC */}
            {categories.length > 0 && (
                <div style={{ backgroundColor: "#fff", padding: "16px 20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "30px", border: "1px solid #f0f0f0", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "#555", marginRight: "6px", whiteSpace: "nowrap" }}>🏷️ Danh mục:</span>

                    {/* Chip "Tất cả" */}
                    <button
                        onClick={() => setSelectedCategory(null)}
                        style={{
                            padding: "7px 18px",
                            borderRadius: "20px",
                            border: selectedCategory === null ? "none" : "1px solid #ddd",
                            background: selectedCategory === null ? "#FF5722" : "#f5f5f5",
                            color: selectedCategory === null ? "white" : "#555",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            transition: "all 0.2s",
                            boxShadow: selectedCategory === null ? "0 3px 10px rgba(255,87,34,0.3)" : "none"
                        }}
                    >
                        Tất cả
                    </button>

                    {/* Chip từng danh mục */}
                    {categories.map((cat) => (
                        <button
                            key={cat.maDanhMuc}
                            onClick={() => setSelectedCategory(
                                selectedCategory === cat.maDanhMuc ? null : cat.maDanhMuc
                            )}
                            style={{
                                padding: "7px 18px",
                                borderRadius: "20px",
                                border: selectedCategory === cat.maDanhMuc ? "none" : "1px solid #ddd",
                                background: selectedCategory === cat.maDanhMuc ? "#FF5722" : "#f5f5f5",
                                color: selectedCategory === cat.maDanhMuc ? "white" : "#555",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "14px",
                                transition: "all 0.2s",
                                boxShadow: selectedCategory === cat.maDanhMuc ? "0 3px 10px rgba(255,87,34,0.3)" : "none"
                            }}
                        >
                            {cat.tenDanhMuc}
                        </button>
                    ))}
                </div>
            )}

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