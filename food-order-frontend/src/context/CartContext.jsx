import { createContext, useState, useContext, useEffect } from "react";

// 1. Tạo một cái Context (giống như cái hộp trống)
const CartContext = createContext();

// 2. Tạo một Provider (người quản lý cái hộp đó)
export function CartProvider({ children }) {
    // Biến cart chứa danh sách món ăn. Ban đầu là mảng rỗng []
    const [cart, setCart] = useState([]);

    // Tự động Load Giỏ Hàng khi Provider Mounted
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const userStr = sessionStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (!user.userId) return;

        try {
            const response = await fetch(`http://localhost:8000/cart/${user.userId}`);
            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error("Lỗi fetch cart:", error);
        }
    };

    const addToCart = async (monAn) => {
        const userStr = sessionStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const resp = await fetch(`http://localhost:8000/cart/add?user_id=${user.userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ maMon: monAn.maMon, soLuong: 1 })
            });

            if (resp.ok) {
                setCart((ghHienTai) => {
                    const monDaCo = ghHienTai.find(item => item.maMon === monAn.maMon);
                    if (monDaCo) {
                        return ghHienTai.map(item =>
                            item.maMon === monAn.maMon
                                ? { ...item, soLuong: item.soLuong + 1 }
                                : item
                        );
                    } else {
                        return [...ghHienTai, { ...monAn, soLuong: 1 }];
                    }
                });
            }
        } catch (error) {
            console.error("Lỗi gửi ADD CART:", error);
        }
    };

    const removeFromCart = async (maMon) => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            try {
                await fetch(`http://localhost:8000/cart/remove/${user.userId}/${maMon}`, {
                    method: "DELETE"
                });
            } catch (error) {}
        }
        setCart((ghHienTai) => ghHienTai.filter(item => item.maMon !== maMon));
    };

    // Hàm cập nhật số lượng món
    const updateQuantity = async (maMon, delta) => {
        const itemObj = cart.find(i => i.maMon === maMon);
        if (!itemObj) return;

        const newQuantity = itemObj.soLuong + delta;
        const finalQuantity = newQuantity > 0 ? newQuantity : 1;

        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            try {
                const resp = await fetch(`http://localhost:8000/cart/update/${user.userId}/${maMon}?so_luong=${finalQuantity}`, {
                    method: "PUT"
                });
                if (resp.ok) {
                    setCart((ghHienTai) => ghHienTai.map(item => 
                        item.maMon === maMon ? { ...item, soLuong: finalQuantity } : item
                    ));
                }
            } catch (error) {
                console.error("Lỗi gửi UPDATE CART:", error);
            }
        }
    };

    // Hàm xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            try {
                const resp = await fetch(`http://localhost:8000/cart/clear/${user.userId}`, {
                    method: "DELETE"
                });
                if (resp.ok) {
                    setCart([]);
                }
            } catch (error) {
                console.error("Lỗi gửi CLEAR CART:", error);
            }
        } else {
            setCart([]);
        }
    };

    // Tổng số lượng món ăn có trong giỏ (để hiện lên cái bong bóng đỏ ở Navbar)
    const tongSoLuong = cart.reduce((total, item) => total + item.soLuong, 0);
    
    // Tính tổng tiền giỏ hàng
    const tongTien = cart.reduce((total, item) => total + (item.giaTien * item.soLuong), 0);

    // Xuất kho những dữ liệu và hàm cần thiết cho các trang khác xài
    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, tongSoLuong, tongTien, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
}

// 3. Tạo một hàm dùng nhanh (Hook) để gọi ở các trang
export const useCart = () => useContext(CartContext);