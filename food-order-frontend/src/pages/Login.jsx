import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    // Tạo "kho lưu trữ" nhỏ (state) để nhớ tên đăng nhập và mật khẩu
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Công cụ dùng để chuyển trang sau khi đăng nhập thành công
    const navigate = useNavigate();

    // Hàm này sẽ chạy khi người dùng bấm nút "Đăng nhập"
    const handleLogin = (e) => {
        e.preventDefault();

        // Lưu thông tin đăng nhập ảo vào trình duyệt
        localStorage.setItem("user", JSON.stringify({ username }));

        // Giả lập: Nếu đăng nhập thành công thì tự động đá về Trang Chủ
        navigate("/"); 
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
        </div>
    );
}