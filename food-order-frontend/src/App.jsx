import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Cart from "./pages/Cart";
import CustomerOrders from "./pages/CustomerOrders";
import { CartProvider, useCart } from "./context/CartContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component Navbar tách riêng để có thể xài được useCart
function Navbar() {
  const { tongSoLuong } = useCart(); // Lấy số lượng từ kho ra
  const navigate = useNavigate();
  const location = useLocation(); // Giúp Navbar tự render lại khi đổi route
  
  // Lấy thông tin user từ Local Storage
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
      sessionStorage.removeItem("user");
      navigate("/"); // Điều hướng về trang chủ
  };

  return (
    <nav style={{ padding: "15px 30px", background: "#FF5722", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold", fontSize: "20px" }}>🍔 FoodOrder</Link>
      </div>
      <div>
        <Link to="/" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>Trang Chủ</Link>
        
        {user ? (
            <span style={{ color: "white", marginRight: "20px" }}>
                Chào, {user.username} 
                <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#FFD54F", cursor: "pointer", fontWeight: "bold", marginLeft: "10px", fontSize: "15px" }}>
                    [Đăng Xuất]
                </button>
            </span>
        ) : (
            <Link to="/login" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>Đăng Nhập</Link>
        )}
        
        {(user && user.role === "admin") && (
            <Link to="/admin" style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: "bold" }}>Quản Lý</Link>
        )}

        {(user && user.role === "customer") && (
            <Link to="/history" style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: "bold" }}>📦 Đơn Hàng</Link>
        )}

        {/* Nút Giỏ Hàng có số lượng */}
        <Link 
          to={user ? "/cart" : "/login"} 
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              toast.warning("Vui lòng đăng nhập để xem giỏ hàng!");
              navigate("/login");
            }
          }}
          style={{ color: "white", textDecoration: "none", position: "relative" }}
        >
          🛒 Giỏ Hàng
          {tongSoLuong > 0 && (
            <span style={{
              position: "absolute", top: "-10px", right: "-15px", background: "white", color: "#FF5722",
              borderRadius: "50%", padding: "2px 6px", fontSize: "12px", fontWeight: "bold"
            }}>
              {tongSoLuong}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    // Bọc CartProvider ở ngoài cùng
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/history" element={<CustomerOrders />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<OrderSuccess />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;