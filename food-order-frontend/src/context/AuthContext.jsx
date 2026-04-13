import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Kiểm tra xem đã log in từ trước chưa
    useEffect(() => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const login = async (username, password) => {
        return new Promise(async (resolve, reject) => {
            // ==========================================================
            // BƯỚC 1: Kiểm tra tài khoản ADMIN/STAFF cứng (mock data)
            // ==========================================================
            if (username === "staff01" && password === "123") {
                const staffUser = { username: "staff01", role: "STAFF", name: "Nhân viên 01" };
                setUser(staffUser);
                sessionStorage.setItem("user", JSON.stringify(staffUser));
                return resolve(staffUser);
            }
            if ((username === "admin01" && password === "123") || (username === "admin" && password === "admin123")) {
                const adminUser = { username: username, role: "ADMIN", name: "Quản trị viên" };
                setUser(adminUser);
                sessionStorage.setItem("user", JSON.stringify(adminUser));
                return resolve(adminUser);
            }

            // ==========================================================
            // BƯỚC 2: Không phải mock -> Gọi API Backend thật
            // ==========================================================
            try {
                const response = await fetch("http://localhost:8000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (!response.ok || data.error) {
                    return reject(new Error(data.detail || "Tên đăng nhập hoặc mật khẩu không đúng!"));
                }

                // Tạo đối tượng user từ response API
                const realUser = {
                    token: data.access_token,
                    userId: data.userId,
                    username: data.username,
                    name: data.hoTen || data.username,
                    role: data.role || "customer"
                };
                setUser(realUser);
                sessionStorage.setItem("user", JSON.stringify(realUser));
                return resolve(realUser);
            } catch (err) {
                return reject(new Error("Lỗi kết nối máy chủ. Vui lòng kiểm tra Backend!"));
            }
        });
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
