import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

// Cấu hình linh tinh để tái sử dụng hiển thị & Màu sắc
const STATUS_CONFIG = {
    pending: { label: "Chờ xác nhận", color: "#FFF3CD", textColor: "#856404", next: "confirmed", prev: null, actionText: "Duyệt đơn", actionColor: "#2196F3" },
    confirmed: { label: "Đã xác nhận", color: "#CCE5FF", textColor: "#004085", next: "preparing", prev: "pending", actionText: "Bắt đầu nấu", actionColor: "#9C27B0" },
    preparing: { label: "Đang chuẩn bị", color: "#E2D9F3", textColor: "#38186D", next: "delivering", prev: "confirmed", actionText: "Giao hàng", actionColor: "#FF9800" },
    delivering: { label: "Đang giao hàng", color: "#FFF3CD", textColor: "#FF9800", next: "completed", prev: "preparing", actionText: "Khách đã nhận", actionColor: "#4CAF50" },
    completed: { label: "Hoàn tất", color: "#D4EDDA", textColor: "#155724", next: null, prev: "delivering", actionText: "Đã xong", actionColor: "#ccc" },
    cancelled: { label: "Đã Bị Hủy", color: "#FFEBEE", textColor: "#C62828", next: null, prev: null, actionText: "Đã Hủy", actionColor: "#ccc" }
};

// Helper lấy JWT token từ sessionStorage
const getToken = () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr).token || null;
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'products', 'categories'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    
    // UI States cho thông báo và xác nhận
    const [notification, setNotification] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [editProduct, setEditProduct] = useState(null); // null = đóng modal, có data = đang sửa
    const [isEditUploading, setIsEditUploading] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };
    // State form cho Món ăn mới
    const [newProduct, setNewProduct] = useState({
        tenMon: "",
        giaTien: "",
        hinhAnh: "",
        moTa: "",
        maDanhMuc: ""
    });
    const [categories, setCategories] = useState([]);
    
    // State form cho Danh mục
    const [newCategory, setNewCategory] = useState({ tenDanhMuc: "", moTa: "" });
    const [editCategory, setEditCategory] = useState(null);
    const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

    // -------- LOGIC QUẢN LÝ MÓN ĂN --------
    const handleImageUpload = async (eOrFile) => {
        let file = (eOrFile && eOrFile.target) ? eOrFile.target.files[0] : eOrFile;
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsUploading(true);
            const token = getToken();
            const response = await fetch("http://localhost:8000/products/upload-image", {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setNewProduct(prev => ({ ...prev, hinhAnh: data.url }));
            } else {
                showNotification("Lỗi upload: " + data.detail, "error");
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            showNotification("Lỗi kết nối khi upload ảnh!", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDropImage = async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageUpload(e.dataTransfer.files[0]);
            return;
        }

        const html = e.dataTransfer.getData("text/html");
        const url = e.dataTransfer.getData("URL") || e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");

        if (html) {
            const match = html.match(/src\s*=\s*"([^"]+)"/);
            if (match && match[1]) {
                setNewProduct(prev => ({ ...prev, hinhAnh: match[1] }));
                return;
            }
        }
        
        if (url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/"))) {
            setNewProduct(prev => ({ ...prev, hinhAnh: url }));
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const endpoint = showDeleted ? "http://localhost:8000/products/all" : "http://localhost:8000/products/";
            const response = await fetch(endpoint);
            const data = await response.json();
            if (showDeleted) {
                setProducts(data.filter(p => p.daXoa === true));
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải món ăn:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = getToken();
            const response = await fetch("http://localhost:8000/orders/", {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            const data = await response.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "products") {
            fetchProducts();
            fetchCategories();
        } else if (activeTab === "orders") {
            fetchOrders();
        } else if (activeTab === "categories") {
            fetchCategories();
        }
    }, [activeTab, showDeleted]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:8000/categories/");
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const res = await fetch("http://localhost:8000/categories/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(newCategory)
            });
            if (res.ok) {
                showNotification("Tạo danh mục thành công!", "success");
                setNewCategory({ tenDanhMuc: "", moTa: "" });
                fetchCategories();
            } else {
                const data = await res.json();
                showNotification(data.detail || "Có lỗi khi tạo danh mục!", "error");
            }
        } catch {
            showNotification("Lỗi kết nối API!", "error");
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        if (!editCategory) return;
        try {
            const token = getToken();
            const res = await fetch(`http://localhost:8000/categories/${editCategory.maDanhMuc}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ tenDanhMuc: editCategory.tenDanhMuc, moTa: editCategory.moTa })
            });
            if (res.ok) {
                showNotification("Cập nhật danh mục thành công!", "success");
                setEditCategory(null);
                fetchCategories();
            } else {
                const data = await res.json();
                showNotification(data.detail || "Lỗi cập nhật!", "error");
            }
        } catch {
            showNotification("Lỗi kết nối API!", "error");
        }
    };

    const handleDeleteCategory = async () => {
        if (!confirmDeleteCat) return;
        try {
            const token = getToken();
            const res = await fetch(`http://localhost:8000/categories/${confirmDeleteCat}`, {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                showNotification("Đã xóa danh mục thành công!", "success");
                setConfirmDeleteCat(null);
                fetchCategories();
            } else {
                showNotification("Lỗi xóa danh mục!", "error");
            }
        } catch {
            showNotification("Lỗi kết nối!", "error");
        }
    };


    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                ...newProduct,
                giaTien: parseFloat(newProduct.giaTien)
            };
            const token = getToken();
            const response = await fetch("http://localhost:8000/products/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                showNotification("Đã thêm món mới thành công!", "success");
                setNewProduct({ tenMon: "", giaTien: "", hinhAnh: "", moTa: "", maDanhMuc: "" }); // Reset form
                fetchProducts(); // Refresh danh sách
            }
        } catch (error) {
            showNotification("Có lỗi xảy ra khi gọi API thêm món!", "error");
            console.error(error);
        }
    };

    const confirmActionDelete = (maMon) => {
        setConfirmDelete(maMon);
    };

    const executeDelete = async () => {
        if (!confirmDelete) return;
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/products/${confirmDelete}`, {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                showNotification("Đã xóa món ăn thành công!", "success");
                fetchProducts();
            } else {
                showNotification("Không thể xóa. Có thể món này đang dính với 1 Giỏ hàng hoặc Đơn hàng nào đó trong DB!", "error");
            }
        } catch (error) {
            console.error(error);
            showNotification("Lỗi khi xóa món!", "error");
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleRestoreProduct = async (maMon) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/products/${maMon}/restore`, {
                method: "PUT",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                showNotification("Phục hồi món ăn từ Thùng rác thành công!", "success");
                fetchProducts();
            } else {
                showNotification("Lỗi khi khôi phục món!", "error");
            }
        } catch (error) {
            console.error(error);
            showNotification("Lỗi kết nối khi khôi phục!", "error");
        }
    };

    const handleToggleProductStatus = async (maMon) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/products/${maMon}/toggle-status`, {
                method: "PUT",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // -------- LOGIC CHỈNH SỬA MÓN ĂN --------
    const openEditModal = (food) => {
        setEditProduct({ ...food }); // Clone object để tránh mutate trực tiếp
    };

    const handleEditImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            setIsEditUploading(true);
            const token = getToken();
            const response = await fetch("http://localhost:8000/products/upload-image", {
                method: "POST",
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setEditProduct(prev => ({ ...prev, hinhAnh: data.url }));
            }
        } catch (err) {
            showNotification("Lỗi upload ảnh!", "error");
        } finally {
            setIsEditUploading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editProduct) return;
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/products/${editProduct.maMon}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    tenMon: editProduct.tenMon,
                    giaTien: parseFloat(editProduct.giaTien),
                    hinhAnh: editProduct.hinhAnh,
                    moTa: editProduct.moTa,
                    maDanhMuc: editProduct.maDanhMuc || null
                })
            });
            if (response.ok) {
                showNotification(`Đã cập nhật "${editProduct.tenMon}" thành công!`, "success");
                setEditProduct(null);
                fetchProducts();
            } else {
                showNotification("Lỗi khi cập nhật món ăn!", "error");
            }
        } catch (err) {
            console.error(err);
            showNotification("Lỗi kết nối!", "error");
        }
    };


    // -------- LOGIC ĐƠN HÀNG --------
    const handleToggleOrderStatus = async (orderId, newStatus) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ trangThai: newStatus })
            });
            if (response.ok) {
                showNotification("Cập nhật trạng thái đơn hàng thành công!", "success");
                fetchOrders();
            } else {
                showNotification("Lỗi cập nhật trạng thái đơn hàng!", "error");
            }
        } catch (error) {
            console.error(error);
            showNotification("Lỗi kết nối khi cập nhật đơn hàng!", "error");
        }
    };

    const handleNextStatus = (orderId, currentStatus) => {
        const nextStatus = STATUS_CONFIG[currentStatus].next;
        if (!nextStatus) return; 
        handleToggleOrderStatus(orderId, nextStatus);
    };

    const handlePrevStatus = (orderId, currentStatus) => {
        const prevStatus = STATUS_CONFIG[currentStatus].prev;
        if (!prevStatus) return; 
        handleToggleOrderStatus(orderId, prevStatus);
    };

    const handleResetAll = async () => {
        try {
            const token = getToken();
            const response = await fetch("http://localhost:8000/orders/reset-all", {
                method: "DELETE",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (response.ok) {
                showNotification("Đã xóa toàn bộ lịch sử đơn hàng!", "success");
                fetchOrders();
            } else {
                showNotification("Lỗi khi xóa dữ liệu!", "error");
            }
        } catch (err) {
            showNotification("Lỗi kết nối!", "error");
        } finally {
            setConfirmReset(false);
        }
    };


    // -------- THỐNG KÊ --------
    const totalRevenue = orders.filter(o => o.trangThai === "completed").reduce((sum, o) => sum + o.tongTien, 0);
    const pendingCount = orders.filter(o => o.trangThai === "pending").length;
    const deliveringCount = orders.filter(o => o.trangThai === "delivering").length;

    // -------- BIỂU ĐỒ & EXPORT --------
    const chartDataMap = {};
    orders.filter(o => o.trangThai === "completed").forEach(o => {
        // o.thoiGian có dạng "YYYY-MM-DD HH:MM..." 
        const dateStr = o.thoiGian ? o.thoiGian.split(' ')[0] : 'Unknown';
        const parts = dateStr.split('-');
        const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;

        if (!chartDataMap[shortDate]) {
            chartDataMap[shortDate] = 0;
        }
        chartDataMap[shortDate] += o.tongTien;
    });

    const chartData = Object.keys(chartDataMap).map(key => ({
        date: key,
        revenue: chartDataMap[key]
    })).sort((a, b) => a.date.localeCompare(b.date));

    const handleExportExcel = () => {
        const completedOrders = orders.filter(o => o.trangThai === "completed");
        if (completedOrders.length === 0) {
            showNotification("Không có dữ liệu đơn hàng hoàn tất để xuất!", "error");
            return;
        }

        const excelData = completedOrders.map(o => ({
            "Mã Đơn": o.id,
            "Khách Hàng": o.khachHang,
            "Số Điện Thoại": o.sdt,
            "Thời Gian Đặt": o.thoiGian,
            "Tổng Tiền (VNĐ)": o.tongTien
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");

        XLSX.writeFile(workbook, "BaoCao_DoanhThu_FoodOrder.xlsx");
        showNotification("Xuất báo cáo Excel thành công!", "success");
    };


    // RENDER: GIAO DIỆN TAB ĐƠN HÀNG
    const renderOrderTab = () => (
        <>
            {/* VÙNG THỐNG KÊ (CARDS) */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #FFC107" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>⚠️</span> Đơn Chờ Xác Nhận
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#333" }}>{pendingCount}</p>
                </div>
                
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #FF9800" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>🛵</span> Đơn Đang Giao
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#333" }}>{deliveringCount}</p>
                </div>
                
                <div style={{ flex: 1, backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderTop: "5px solid #4CAF50" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>💵</span> Doanh Thu (Hoàn tất)
                    </h3>
                    <p style={{ margin: 0, fontSize: "36px", fontWeight: "bold", color: "#4CAF50" }}>{totalRevenue.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* VÙNG BIỂU ĐỒ DOANH THU */}
            <div style={{ backgroundColor: "#fff", padding: "20px 25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "40px" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "18px", borderLeft: "4px solid #4CAF50", paddingLeft: "10px" }}>
                    📈 Biểu đồ Doanh Thu theo Ngày
                </h3>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis tickFormatter={(val) => (val / 1000) + 'k'} />
                                <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' đ'} />
                                <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Doanh Thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#888' }}>
                        Chưa có dữ liệu giao dịch hoàn tất để vẽ biểu đồ
                    </div>
                )}
            </div>

            {/* VÙNG BẢNG ĐƠN HÀNG */}
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "20px 25px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>Danh Sách Đơn Hàng Mới Nhất</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleExportExcel}
                            style={{ padding: "8px 15px", backgroundColor: "#1976D2", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", transition: "0.2s" }}
                            className="btn-hover"
                        >
                            📥 Xuất Báo Cáo
                        </button>
                        <button 
                            onClick={fetchOrders}
                            style={{ padding: "8px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", transition: "0.2s" }}
                            className="btn-hover"
                        >
                            🔄 Làm mới
                        </button>
                        <button 
                            onClick={() => setConfirmReset(true)}
                            style={{ padding: "8px 15px", backgroundColor: "#F44336", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", transition: "0.2s" }}
                        >
                            🗑️ Reset Dữ Liệu
                        </button>
                    </div>
                </div>
                
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "15px" }}>
                                <th style={{ padding: "18px 25px", borderBottom: "2px solid #ddd", width: "120px" }}>Mã Đơn</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd" }}>Khách Hàng</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "150px" }}>Thời Gian</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "150px" }}>Tổng Tiền</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "180px" }}>Trạng Thái</th>
                                <th style={{ padding: "18px 25px", borderBottom: "2px solid #ddd", textAlign: "right", width: "150px" }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => {
                                const statusInfo = STATUS_CONFIG[order.trangThai];
                                
                                return (
                                    <tr key={order.id} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", transition: "0.2s" }} className="table-row-hover">
                                        <td style={{ padding: "18px 25px", fontWeight: "bold", color: "#FF5722" }}>#{order.id}</td>
                                        <td style={{ padding: "18px 20px" }}>
                                            <div style={{ fontWeight: "bold", color: "#333", marginBottom: "6px" }}>{order.khachHang}</div>
                                            <div style={{ fontSize: "14px", color: "#888" }}>Điện thoại: {order.sdt}</div>
                                        </td>
                                        <td style={{ padding: "18px 20px", color: "#666", fontSize: "15px" }}>{order.thoiGian}</td>
                                        <td style={{ padding: "18px 20px", fontWeight: "bold", color: "#333", fontSize: "16px" }}>{order.tongTien.toLocaleString('vi-VN')} đ</td>
                                        <td style={{ padding: "18px 20px" }}>
                                            <span style={{ 
                                                display: "inline-block", padding: "6px 14px", 
                                                backgroundColor: statusInfo.color, color: statusInfo.textColor,
                                                borderRadius: "20px", fontSize: "13px", fontWeight: "bold", boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: "18px 25px", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                {statusInfo.prev && (
                                                    <button onClick={() => handlePrevStatus(order.id, order.trangThai)} title="Hoàn tác" style={{ padding: "10px", backgroundColor: "#fff", color: "#555", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                                                        ⟲
                                                    </button>
                                                )}
                                                {statusInfo.next ? (
                                                    <button onClick={() => handleNextStatus(order.id, order.trangThai)} style={{ padding: "10px 18px", backgroundColor: statusInfo.actionColor, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: "120px" }}>
                                                        {statusInfo.actionText} ➜
                                                    </button>
                                                ) : (
                                                    <span style={{ color: "#aaa", fontSize: "14px", fontWeight: "bold", fontStyle: "italic", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "38px", width: "120px" }}>
                                                        Không có HĐ
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#888", fontSize: "16px" }}>Hệ thống không có đơn hàng nào vào lúc này.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    // RENDER: GIAO DIỆN TAB MÓN ĂN
    const renderProductTab = () => (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexDirection: "row" }}>
            
            {/* Cột trái: Form thêm món */}
            <div style={{ flex: "0 0 350px", backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333", borderBottom: "2px solid #eee", paddingBottom: "10px", fontSize: "18px" }}>
                    Tạo Món Ăn Mới
                </h3>
                <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Tên món <span style={{color: "red"}}>*</span></label>
                        <input required type="text" value={newProduct.tenMon} onChange={(e) => setNewProduct({...newProduct, tenMon: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px", outline: "none" }} placeholder="VD: Bún Bò Huế" />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Giá tiền (VNĐ) <span style={{color: "red"}}>*</span></label>
                        <input required type="number" min="0" value={newProduct.giaTien} onChange={(e) => setNewProduct({...newProduct, giaTien: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px", outline: "none" }} placeholder="VD: 55000" />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Danh mục <span style={{color: "red"}}>*</span></label>
                        <select
                            required
                            value={newProduct.maDanhMuc}
                            onChange={(e) => setNewProduct({...newProduct, maDanhMuc: e.target.value})}
                            style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px", outline: "none", backgroundColor: "#fff", cursor: "pointer" }}
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.maDanhMuc} value={cat.maDanhMuc}>{cat.tenDanhMuc}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Hình ảnh thu nhỏ</label>
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDropImage}
                            style={{ 
                                width: "100%", padding: "20px 10px", borderRadius: "6px", 
                                border: isDragOver ? "2px dashed #4CAF50" : "2px dashed #FF5722", 
                                boxSizing: "border-box", textAlign: "center", cursor: "pointer", 
                                backgroundColor: isDragOver ? "#e8f5e9" : "#fff5f2", transition: "0.2s" 
                            }}
                            onClick={() => document.getElementById("file-upload").click()}
                        >
                            <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                            <div style={{ color: "#FF5722", fontWeight: "bold", marginBottom: "5px", fontSize: "15px" }}>📥 Kéo & thả ảnh từ trình duyệt vào đây</div>
                            <div style={{ fontSize: "13px", color: "#666" }}>(Hoặc nhấn để tải ảnh lên từ máy)</div>
                        </div>
                        
                        {isUploading && <div style={{ fontSize: "13px", color: "#2196F3", marginTop: "8px", fontWeight: "bold" }}>⏳ Đang tải ảnh lên máy chủ...</div>}
                        
                        {newProduct.hinhAnh && !isUploading && (
                            <div style={{ marginTop: "12px", textAlign: "center", backgroundColor: "#fafafa", padding: "10px", borderRadius: "8px", border: "1px solid #eee" }}>
                                <div style={{ fontSize: "12px", color: "#4CAF50", marginBottom: "8px", fontWeight: "bold" }}>✓ Tải ảnh thành công (Xem trước)</div>
                                <img src={newProduct.hinhAnh} style={{ maxWidth: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} alt="Preview" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Mô tả ngắn</label>
                        <textarea value={newProduct.moTa} onChange={(e) => setNewProduct({...newProduct, moTa: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", minHeight: "100px", boxSizing: "border-box", fontSize: "15px", resize: "vertical", outline: "none" }} placeholder="VD: Thơm ngon mời bạn ăn nha..." />
                    </div>
                    <button type="submit" style={{ padding: "14px", backgroundColor: "#FF5722", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", fontSize: "16px", boxShadow: "0 4px 10px rgba(255, 87, 34, 0.3)", transition: "0.2s" }}>
                        + Lưu Vào Menu
                    </button>
                </form>
            </div>

            {/* Cột phải: Bảng danh sách món */}
            <div style={{ flex: 1, backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "20px 25px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
                        {showDeleted ? "Thùng Rác (Món đã xóa)" : "Danh Sách Món Ăn DB"}
                    </h2>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#888", backgroundColor: "#E3F2FD", padding: "4px 10px", borderRadius: "20px", color: "#1976D2", fontWeight: "bold" }}>
                            Tổng số: {products.length} món
                        </span>
                        <button 
                            onClick={() => setShowDeleted(!showDeleted)}
                            style={{ padding: "6px 12px", backgroundColor: showDeleted ? "#F44336" : "#f5f5f5", color: showDeleted ? "white" : "#555", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "0.3s" }}
                        >
                            {showDeleted ? "← Về Danh sách Menu" : "🗑️ Mở Thùng Rác"}
                        </button>
                    </div>
                </div>
                
                {isLoading ? (
                    <div style={{ padding: "50px", textAlign: "center", color: "#888", fontSize: "16px" }}>🔄 Đang tải dữ liệu thực đơn từ Database...</div>
                ) : (
                    <div style={{ overflowX: "auto", maxHeight: "800px", overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "15px", boxShadow: "0 2px 2px -1px rgba(0,0,0,0.1)" }}>
                                    <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "60px" }}>ID</th>
                                    <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd" }}>Thông tin món ăn</th>
                                    <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "130px" }}>Giá Bán</th>
                                    <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "120px" }}>Tình trạng</th>
                                    <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", textAlign: "right", width: "200px" }}>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#888", fontStyle: "italic" }}>
                                            Chưa có món ăn nào trong hệ thống. Khách hàng sẽ thấy menu rỗng!
                                        </td>
                                    </tr>
                                ) : products.map((food, index) => (
                                    <tr key={food.maMon} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", transition: "0.2s" }} className="table-row-hover">
                                        <td style={{ padding: "15px 20px", color: "#888", fontWeight: "bold" }}>#{food.maMon}</td>
                                        <td style={{ padding: "15px 20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                {food.hinhAnh ? (
                                                    <img src={food.hinhAnh} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} alt={food.tenMon} />
                                                ) : (
                                                    <div style={{ width: "50px", height: "50px", borderRadius: "8px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>No IMG</div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: "bold", color: "#333", fontSize: "16px", marginBottom: "4px" }}>
                                                        {food.daXoa ? <span style={{ color: "red", border: "1px solid red", padding: "2px 4px", fontSize: "10px", borderRadius: "4px", marginRight: "8px" }}>ĐÃ XÓA</span> : null}
                                                        {food.tenMon}
                                                    </div>
                                                    <div style={{ fontSize: "13px", color: "#777", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {food.moTa || "Không có mô tả"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "15px 20px", color: "#FF5722", fontWeight: "bold", fontSize: "16px" }}>
                                            {food.giaTien.toLocaleString('vi-VN')} đ
                                        </td>
                                        <td style={{ padding: "15px 20px" }}>
                                            {food.conHang !== false ? (
                                                <span style={{ padding: "6px 12px", backgroundColor: "#E8F5E9", color: "#2E7D32", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", border: "1px solid #A5D6A7" }}>
                                                    🟢 Còn hàng
                                                </span>
                                            ) : (
                                                <span style={{ padding: "6px 12px", backgroundColor: "#FFEBEE", color: "#C62828", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", border: "1px solid #EF9A9A" }}>
                                                    🔴 Hết hàng
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                                {food.daXoa ? (
                                                    <button
                                                        onClick={() => handleRestoreProduct(food.maMon)}
                                                        style={{
                                                            padding: "8px 15px", backgroundColor: "#E3F2FD", color: "#1976D2",
                                                            border: "1px solid #90CAF9", borderRadius: "6px",
                                                            cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "0.2s"
                                                        }}
                                                    >
                                                        ↩️ Khôi Phục Lại Món Này
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => openEditModal(food)}
                                                            style={{
                                                                padding: "8px 12px", backgroundColor: "#fff", color: "#1976D2",
                                                                border: "1px solid #90CAF9", borderRadius: "6px",
                                                                cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "0.2s"
                                                            }}
                                                        >
                                                            ✏️ Sửa
                                                        </button>

                                                        <button 
                                                            onClick={() => handleToggleProductStatus(food.maMon)}
                                                            style={{ 
                                                                padding: "8px 12px", 
                                                                backgroundColor: "#fff", 
                                                                color: food.conHang !== false ? "#F57C00" : "#388E3C", 
                                                                border: `1px solid ${food.conHang !== false ? "#FFB74D" : "#81C784"}`, 
                                                                borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "0.2s"
                                                            }}
                                                            title={food.conHang !== false ? "Đánh dấu là Hết hàng" : "Đánh dấu là Còn hàng"}
                                                        >
                                                            {food.conHang !== false ? "Báo Hết" : "Mở Bán Lại"}
                                                        </button>

                                                        <button 
                                                            onClick={() => confirmActionDelete(food.maMon)}
                                                            style={{ 
                                                                padding: "8px 12px", backgroundColor: "#fff", color: "#d32f2f", border: "1px solid #ef5350", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", transition: "0.2s"
                                                            }}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // RENDER: GIAO DIỆN TAB DANH MỤC
    const renderCategoryTab = () => (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexDirection: "row" }}>
            
            {/* Cột trái: Form Thêm Danh mục */}
            <div style={{ flex: "0 0 350px", backgroundColor: "#fff", padding: "25px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", position: "sticky", top: "20px" }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333", borderBottom: "2px solid #eee", paddingBottom: "10px", fontSize: "18px" }}>
                    Tiêu Chuẩn Danh Mục Mới
                </h3>
                <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Tên danh mục <span style={{color: "red"}}>*</span></label>
                        <input required type="text" value={newCategory.tenDanhMuc} onChange={(e) => setNewCategory({...newCategory, tenDanhMuc: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px", outline: "none" }} placeholder="VD: Món Tráng Miệng" />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", color: "#555", fontWeight: "bold", fontSize: "14px" }}>Mô tả ngắn</label>
                        <textarea value={newCategory.moTa} onChange={(e) => setNewCategory({...newCategory, moTa: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", minHeight: "100px", boxSizing: "border-box", fontSize: "15px", resize: "vertical", outline: "none" }} placeholder="VD: Các món kem, bánh ngọt..." />
                    </div>
                    <button type="submit" style={{ padding: "14px", backgroundColor: "#9C27B0", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", fontSize: "16px", boxShadow: "0 4px 10px rgba(156, 39, 176, 0.3)", transition: "0.2s" }}>
                        + Thêm Danh Mục
                    </button>
                </form>
            </div>

            {/* Cột phải: Bảng danh sách danh mục */}
            <div style={{ flex: 1, backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "20px 25px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
                        Danh Sách Danh Mục DB
                    </h2>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#888", backgroundColor: "#F3E5F5", padding: "4px 10px", borderRadius: "20px", color: "#8E24AA", fontWeight: "bold" }}>
                            Tổng: {categories.length} danh mục
                        </span>
                    </div>
                </div>
                
                <div style={{ overflowX: "auto", maxHeight: "800px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr style={{ backgroundColor: "#f5f5f5", color: "#555", fontSize: "15px", boxShadow: "0 2px 2px -1px rgba(0,0,0,0.1)" }}>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", width: "60px" }}>ID</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd" }}>Tên Danh Mục</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd" }}>Mô tả</th>
                                <th style={{ padding: "18px 20px", borderBottom: "2px solid #ddd", textAlign: "right", width: "150px" }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#888", fontStyle: "italic" }}>
                                        Chưa có danh mục nào. Hãy bổ sung!
                                    </td>
                                </tr>
                            ) : categories.map((cat, index) => (
                                <tr key={cat.maDanhMuc} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", transition: "0.2s" }} className="table-row-hover">
                                    <td style={{ padding: "15px 20px", color: "#888", fontWeight: "bold" }}>#{cat.maDanhMuc}</td>
                                    <td style={{ padding: "15px 20px", fontWeight: "bold", color: "#333", fontSize: "16px" }}>
                                        {cat.tenDanhMuc}
                                    </td>
                                    <td style={{ padding: "15px 20px", color: "#777", fontSize: "14px" }}>
                                        {cat.moTa || "Không có mô tả"}
                                    </td>
                                    <td style={{ padding: "15px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                            <button 
                                                onClick={() => setEditCategory(cat)}
                                                style={{ 
                                                    padding: "8px 12px", backgroundColor: "#fff", color: "#1976D2", border: "1px solid #90CAF9", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold"
                                                }}
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDeleteCat(cat.maDanhMuc)}
                                                style={{ 
                                                    padding: "8px 12px", backgroundColor: "#fff", color: "#d32f2f", border: "1px solid #ef5350", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold"
                                                }}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", position: "relative" }}>
            
            {/* THÔNG BÁO TOAST */}
            {notification && (
                <div style={{
                    position: "fixed", top: "20px", right: "20px", zIndex: 1000,
                    backgroundColor: notification.type === "success" ? "#4CAF50" : "#F44336",
                    color: "white", padding: "15px 25px", borderRadius: "8px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)", outline: "none", fontWeight: "bold",
                    animation: "fadeIn 0.3s, fadeOut 0.3s 2.7s forwards"
                }}>
                    {notification.message}
                </div>
            )}

            {/* MODAL CHỈNH SỬA MÓN ĂN */}
            {editProduct && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.55)", zIndex: 2000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }} onClick={(e) => { if (e.target === e.currentTarget) setEditProduct(null); }}>
                    <div style={{
                        backgroundColor: "#fff", padding: "32px", borderRadius: "14px",
                        width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                        maxHeight: "90vh", overflowY: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ margin: 0, color: "#333", fontSize: "20px" }}>✏️ Chỉnh sửa món ăn</h3>
                            <button onClick={() => setEditProduct(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888", lineHeight: 1 }}>✕</button>
                        </div>

                        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Tên món <span style={{ color: "red" }}>*</span></label>
                                <input
                                    required type="text"
                                    value={editProduct.tenMon || ""}
                                    onChange={(e) => setEditProduct(prev => ({ ...prev, tenMon: e.target.value }))}
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Giá tiền (VNĐ) <span style={{ color: "red" }}>*</span></label>
                                <input
                                    required type="number" min="0"
                                    value={editProduct.giaTien || ""}
                                    onChange={(e) => setEditProduct(prev => ({ ...prev, giaTien: e.target.value }))}
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Mô tả</label>
                                <textarea
                                    value={editProduct.moTa || ""}
                                    onChange={(e) => setEditProduct(prev => ({ ...prev, moTa: e.target.value }))}
                                    rows="3"
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", resize: "vertical", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Danh mục</label>
                                <select
                                    value={editProduct.maDanhMuc || ""}
                                    onChange={(e) => setEditProduct(prev => ({ ...prev, maDanhMuc: e.target.value ? parseInt(e.target.value) : null }))}
                                    style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", boxSizing: "border-box", outline: "none", backgroundColor: "#fff", cursor: "pointer" }}
                                >
                                    <option value="">-- Không thuộc danh mục nào --</option>
                                    {categories.map(cat => (
                                        <option key={cat.maDanhMuc} value={cat.maDanhMuc}>{cat.tenDanhMuc}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Đổi hình ảnh (tùy chọn)</label>
                                <input type="file" accept="image/*" onChange={handleEditImageUpload}
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "2px dashed #1976D2", boxSizing: "border-box", cursor: "pointer", backgroundColor: "#E3F2FD" }}
                                />
                                {isEditUploading && <div style={{ marginTop: "6px", fontSize: "13px", color: "#1976D2", fontWeight: "bold" }}>⏳ Đang tải ảnh lên...</div>}
                                {editProduct.hinhAnh && !isEditUploading && (
                                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                                        <img src={editProduct.hinhAnh} alt="preview" style={{ height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                <button type="button" onClick={() => setEditProduct(null)}
                                    style={{ flex: 1, padding: "13px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: "bold", color: "#555", fontSize: "15px" }}
                                >
                                    Hủy
                                </button>
                                <button type="submit"
                                    style={{ flex: 2, padding: "13px", border: "none", borderRadius: "8px", background: "#1976D2", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "15px", boxShadow: "0 4px 12px rgba(25,118,210,0.3)" }}
                                >
                                    💾 Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN XÓA */}
            {confirmDelete && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", maxWidth: "400px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Xác nhận xóa món ăn?</h3>
                        <p style={{ color: "#666", marginBottom: "25px", fontSize: "15px", lineHeight: "1.5" }}>Hành động này không thể hoàn tác. Món ăn sẽ bị xóa vĩnh viễn khỏi thực đơn.</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button onClick={() => setConfirmDelete(null)} style={{ padding: "10px 20px", border: "1px solid #ccc", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#555", transition: "0.2s" }} className="btn-hover">
                                Hủy Bỏ
                            </button>
                            <button onClick={executeDelete} style={{ padding: "10px 20px", border: "none", backgroundColor: "#F44336", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }} className="btn-hover">
                                Vâng, Xóa Luôn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHỈNH SỬA DANH MỤC */}
            {editCategory && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.55)", zIndex: 2000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }} onClick={(e) => { if (e.target === e.currentTarget) setEditCategory(null); }}>
                    <div style={{
                        backgroundColor: "#fff", padding: "32px", borderRadius: "14px",
                        width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ margin: 0, color: "#333", fontSize: "20px" }}>✏️ Sửa Danh Mục</h3>
                            <button onClick={() => setEditCategory(null)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888", lineHeight: 1 }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateCategory} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Tên danh mục <span style={{color: "red"}}>*</span></label>
                                <input required type="text" value={editCategory.tenDanhMuc} onChange={(e) => setEditCategory({...editCategory, tenDanhMuc: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "15px", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#555", fontSize: "14px" }}>Mô tả ngắn</label>
                                <textarea value={editCategory.moTa || ""} onChange={(e) => setEditCategory({...editCategory, moTa: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", minHeight: "100px", boxSizing: "border-box", fontSize: "15px", resize: "vertical", outline: "none" }} />
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <button type="button" onClick={() => setEditCategory(null)} style={{ flex: 1, padding: "12px", border: "1px solid #ddd", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#555" }}>Hủy</button>
                                <button type="submit" style={{ flex: 1, padding: "12px", border: "none", backgroundColor: "#1976D2", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Lưu Thay Đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {/* MODAL XÁC NHẬN XÓA DANH MỤC */}
             {confirmDeleteCat && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", maxWidth: "400px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Xóa Danh Mục?</h3>
                        <p style={{ color: "#666", marginBottom: "25px", fontSize: "15px", lineHeight: "1.5" }}>Hành động này sẽ xóa danh mục này khỏi CSDL.</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button onClick={() => setConfirmDeleteCat(null)} style={{ padding: "10px 20px", border: "1px solid #ccc", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#555" }}>Hủy Bỏ</button>
                            <button onClick={handleDeleteCategory} style={{ padding: "10px 20px", border: "none", backgroundColor: "#F44336", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Xóa Ngay</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
                <h1 style={{ color: "#333", margin: 0, borderLeft: "5px solid #FF5722", paddingLeft: "15px" }}>
                    Bảng Điều Khiển Quản Trị
                </h1>

                {/* Tab Menu Switcher */}
                <div style={{ display: "flex", gap: "5px", backgroundColor: "#f5f5f5", padding: "6px", borderRadius: "10px", border: "1px solid #ddd" }}>
                    <button 
                        onClick={() => setActiveTab("orders")}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", transition: "0.2s",
                            backgroundColor: activeTab === "orders" ? "#fff" : "transparent",
                            color: activeTab === "orders" ? "#FF5722" : "#666",
                            boxShadow: activeTab === "orders" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
                        }}
                    >
                        📋 Đơn Hàng
                    </button>
                    <button 
                        onClick={() => setActiveTab("products")}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", transition: "0.2s",
                            backgroundColor: activeTab === "products" ? "#fff" : "transparent",
                            color: activeTab === "products" ? "#FF5722" : "#666",
                            boxShadow: activeTab === "products" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
                        }}
                    >
                        🍔 Món Ăn
                    </button>
                    <button 
                        onClick={() => setActiveTab("categories")}
                        style={{
                            padding: "10px 24px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px", transition: "0.2s",
                            backgroundColor: activeTab === "categories" ? "#fff" : "transparent",
                            color: activeTab === "categories" ? "#FF5722" : "#666",
                            boxShadow: activeTab === "categories" ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
                        }}
                    >
                        🏷️ Danh Mục
                    </button>
                </div>
            </div>

            {/* Render Component dựa theo Tab đang Active */}
            {activeTab === "orders" && renderOrderTab()}
            {activeTab === "products" && renderProductTab()}
            {activeTab === "categories" && renderCategoryTab()}

            <style>
                {`
                    .table-row-hover:hover {
                        background-color: #f1f8e9 !important;
                    }
                    button:hover {
                        transform: translateY(-1px);
                    }
                    button:active {
                        transform: translateY(1px);
                    }
                    .btn-hover:hover {
                        opacity: 0.8 !important;
                    }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
                `}
            </style>
            {/* Modal Xác Nhận Reset Toàn Bộ Dữ Liệu */}
            {confirmReset && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 3000,
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ backgroundColor: "#fff", padding: "35px", borderRadius: "12px", maxWidth: "420px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                        <div style={{ fontSize: "60px", marginBottom: "15px" }}>🗑️</div>
                        <h3 style={{ margin: "0 0 10px 0", color: "#c62828", fontSize: "20px" }}>Xóa Toàn Bộ Lịch Sử?</h3>
                        <p style={{ color: "#666", marginBottom: "25px", fontSize: "15px", lineHeight: "1.6" }}>
                            Hành động này sẽ <strong>xóa vĩnh viễn toàn bộ</strong> đơn hàng và giỏ hàng trong hệ thống.<br/>
                            <span style={{ color: "#F44336", fontWeight: "bold" }}>Không thể hoàn tác!</span>
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => setConfirmReset(false)}
                                style={{ padding: "10px 24px", border: "1px solid #ccc", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", color: "#555", fontSize: "15px" }}
                            >
                                ❌ Hủy Bỏ
                            </button>
                            <button
                                onClick={handleResetAll}
                                style={{ padding: "10px 24px", border: "none", backgroundColor: "#F44336", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}
                            >
                                🗑️ Xóa Tất Cả
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}