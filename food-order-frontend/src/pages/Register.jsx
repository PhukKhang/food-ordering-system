import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                toast.success("Đăng ký thành công! Hãy đăng nhập nhé.");
                navigate("/login");
            } else {
                const data = await response.json();
                toast.error(data.detail || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            toast.error("Lỗi kết nối máy chủ");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #eee", borderRadius: "10px", fontFamily: "sans-serif", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", backgroundColor: "#fff" }}>
            <h2 style={{ textAlign: "center", color: "#FF5722", marginBottom: "25px" }}>Đăng ký tài khoản</h2>

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Tên đăng nhập:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: "100%", padding: "12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="Chọn tên tài khoản..."
                        required
                    />
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#555" }}>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "12px", boxSizing: "border-box", borderRadius: "6px", border: "1px solid #ccc" }}
                        placeholder="Đặt mật khẩu..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    style={{ width: "100%", padding: "14px", background: "#FF5722", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                >
                    TẠO TÀI KHOẢN KẾT NỐI
                </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "15px", color: "#666" }}>
                Đã có tài khoản? <Link to="/login" style={{ color: "#2196F3", fontWeight: "bold", textDecoration: "none" }}>Đăng nhập ngay</Link>
            </p>
        </div>
    );
}
