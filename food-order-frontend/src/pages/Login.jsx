import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Login() {
    // Tạo "kho lưu trữ" nhỏ (state) để nhớ tên đăng nhập và mật khẩu
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Công cụ dùng để chuyển trang sau khi đăng nhập thành công
    const navigate = useNavigate();
    const { fetchCart } = useCart(); // Lấy hàm đồng bộ giỏ hàng
    const { login } = useAuth(); // Hardcoded mock login từ context

    // Hàm này sẽ chạy khi người dùng bấm nút "Đăng nhập"
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Thay thế gọi lên Backend bằng Mock Data Login từ AuthContext
            const userData = await login(username, password);
            toast.success(`Đăng nhập thành công! Chào ${userData.name}`);

            // Đồng bộ Giỏ hàng (nếu có API) 
            await fetchCart();

            // Nếu role là ADMIN hoặc STAFF -> Bật sang trang Admin Dashboard
            if (userData.role === "ADMIN" || userData.role === "STAFF" || userData.role === "admin") {
                navigate("/admin");
            } else {
                // Khách hàng -> Về trang chủ
                navigate("/"); 
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            // In thẳng lỗi do `login` Promise reject trả về
            toast.error(error.message || "Tên đăng nhập hoặc mật khẩu không đúng!");
        }
    };

    return (
        // Phần giao diện (HTML) được viết bằng CSS nội tuyến tạm thời cho dễ nhìn
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", fontFamily: "sans-serif" }}>
            <h2 style={{ textAlign: "center" }}>Đăng nhập hệ thống</h2>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Tên đăng nhập:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Mỗi khi gõ phím, tự động lưu chữ vào biến username
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        placeholder="Nhập tên tài khoản..."
                        required
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Lưu chữ vào biến password
                        style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        placeholder="Nhập mật khẩu..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={{ width: "100%", padding: "10px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}
                >
                    Đăng nhập
                </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "15px", color: "#666" }}>
                Chưa có tài khoản? <Link to="/register" style={{ color: "#FF5722", fontWeight: "bold", textDecoration: "none" }}>Đăng ký ngay</Link>
            </p>
        </div>
    );
}