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

    const login = (username, password) => {
        return new Promise((resolve, reject) => {
            // Mock Data Hardcode theo yêu cầu
            if (username === "staff01" && password === "123") {
                const staffUser = { username: "staff01", role: "STAFF", name: "Nhân viên 01" };
                setUser(staffUser);
                sessionStorage.setItem("user", JSON.stringify(staffUser));
                resolve(staffUser);
            } else if ((username === "admin01" && password === "123") || (username === "admin" && password === "admin123")) {
                const adminUser = { username: username === "admin" ? "admin" : "admin01", role: "ADMIN", name: "Quản trị viên" };
                setUser(adminUser);
                sessionStorage.setItem("user", JSON.stringify(adminUser));
                resolve(adminUser);
            } else if (username === "khachhang" && password === "123") {
                // Hardcode cho customer nếu muốn dùng để pass auth checkout
                const customerUser = { username: "khachhang", role: "customer", name: "Khách Hàng VIP" };
                setUser(customerUser);
                sessionStorage.setItem("user", JSON.stringify(customerUser));
                resolve(customerUser);
            } else {
                reject(new Error("Tên đăng nhập hoặc mật khẩu không đúng!"));
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
