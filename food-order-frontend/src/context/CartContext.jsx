import { createContext, useState, useContext } from "react";

// 1. Tạo một cái Context (giống như cái hộp trống)
const CartContext = createContext();

// 2. Tạo một Provider (người quản lý cái hộp đó)
export function CartProvider({ children }) {
    // Biến cart chứa danh sách món ăn. Ban đầu là mảng rỗng []
    const [cart, setCart] = useState([]);

    // Hàm thêm món vào giỏ
    const addToCart = (monAn) => {
        setCart((ghHienTai) => {
            // Kiểm tra xem món này đã có trong giỏ chưa
            const monDaCo = ghHienTai.find(item => item.maMon === monAn.maMon);

            if (monDaCo) {
                // Nếu có rồi thì tăng số lượng lên 1
                return ghHienTai.map(item =>
                    item.maMon === monAn.maMon
                        ? { ...item, soLuong: item.soLuong + 1 }
                        : item
                );
            } else {
                // Nếu chưa có thì thêm món mới vào, mặc định số lượng là 1
                return [...ghHienTai, { ...monAn, soLuong: 1 }];
            }
        });
    };

    // Hàm xóa món khỏi giỏ hàng
    const removeFromCart = (maMon) => {
        setCart((ghHienTai) => ghHienTai.filter(item => item.maMon !== maMon));
    };

    // Hàm cập nhật số lượng món
    const updateQuantity = (maMon, delta) => {
        setCart((ghHienTai) => ghHienTai.map(item => {
            if (item.maMon === maMon) {
                const newQuantity = item.soLuong + delta;
                return { ...item, soLuong: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
        }));
    };

    // Hàm xóa toàn bộ giỏ hàng
    const clearCart = () => {
        setCart([]);
    };

    // Tổng số lượng món ăn có trong giỏ (để hiện lên cái bong bóng đỏ ở Navbar)
    const tongSoLuong = cart.reduce((total, item) => total + item.soLuong, 0);
    
    // Tính tổng tiền giỏ hàng
    const tongTien = cart.reduce((total, item) => total + (item.giaTien * item.soLuong), 0);

    // Xuất kho những dữ liệu và hàm cần thiết cho các trang khác xài
    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, tongSoLuong, tongTien }}>
            {children}
        </CartContext.Provider>
    );
}

// 3. Tạo một hàm dùng nhanh (Hook) để gọi ở các trang
export const useCart = () => useContext(CartContext);