# Project Proposal

## THÔNG TIN

### Nhóm

- Thành viên 1: Nguyễn Trần Phúc Khang - 23660931
- Thành viên 2:
- Thành viên 3: 
- Thành viên 4:

### Git

Git repository: [<link>](https://github.com/PhukKhang/food-ordering-system)

```
Lưu ý: 
- chỉ tạo git repository một lần, nếu đổi link repo nhóm sẽ bị trừ điểm.
```

## MÔ TẢ DỰ ÁN

### Ý tưởng

Dự án Food Ordering System là một ứng dụng web cho phép người dùng xem menu, chọn món, đặt hàng và theo dõi trạng thái đơn hàng trực tuyến. Hệ thống hướng đến hai nhóm người dùng chính là khách hàng và quản lý/nhân viên nhà hàng.

Quy trình đặt món bao gồm các bước: xem menu, chọn món ăn, đặt hàng, thanh toán và theo dõi trạng thái đơn hàng. Hệ thống hỗ trợ các chức năng như quản lý menu, quản lý đơn hàng và quản lý người dùng. Ngoài ra, quản trị viên có thể theo dõi thống kê đơn hàng thông qua dashboard quản lý.

Tôi lựa chọn đề tài này vì đây là một dự án phù hợp với người mới bắt đầu, đồng thời cho phép áp dụng các kiến thức về phát triển web, xây dựng API và quản lý cơ sở dữ liệu.

Điểm khác biệt của hệ thống là cung cấp chức năng gợi ý món ăn và dashboard thống kê đơn hàng giúp quản lý dễ dàng theo dõi tình hình kinh doanh.

### Chi tiết


# Mô tả chi tiết nghiệp vụ của hệ thống Food Ordering System

## 1. Các vai trò trong hệ thống

Hệ thống Food Ordering System bao gồm ba vai trò chính:

### Khách hàng (Customer)

Khách hàng là người sử dụng hệ thống để xem menu, đặt món ăn và theo dõi đơn hàng.

**Quyền của khách hàng:**

- Đăng ký tài khoản  
- Đăng nhập / đăng xuất  
- Xem menu món ăn  
- Xem chi tiết món ăn  
- Tìm kiếm món ăn theo danh mục hoặc giá  
- Thêm món ăn vào giỏ hàng  
- Chỉnh sửa số lượng hoặc xóa món khỏi giỏ hàng  
- Thanh toán đơn hàng  
- Theo dõi trạng thái đơn hàng  
- Xem lịch sử đặt hàng  
- Hủy đơn hàng trong một số trường hợp  

**Giới hạn:**

- Không được chỉnh sửa menu  
- Không được đặt hàng khi chưa đăng nhập  
- Không được đặt hàng khi giỏ hàng trống  
- Không được xem thống kê doanh thu  

---

### Nhân viên (Staff)

Nhân viên chịu trách nhiệm xử lý các đơn hàng của khách hàng.

**Quyền của nhân viên:**

- Xem danh sách đơn hàng mới  
- Xác nhận đơn hàng  
- Cập nhật trạng thái đơn hàng  
- Hủy đơn hàng khi cần  
- Xem lịch sử bán hàng  
- Xem thống kê bán hàng  
- Cập nhật trạng thái món ăn (còn hàng / hết hàng)  

**Giới hạn:**

- Không được thêm món ăn  
- Không được chỉnh sửa món ăn  
- Không được xóa món ăn  
- Không được đặt món  

---

### Quản lí (Manager)

Quản lí có tất cả quyền của nhân viên và thêm các quyền quản trị hệ thống.

**Quyền của quản lí:**

- Quản lý menu (thêm, sửa, xóa món ăn)  
- Quản lý danh mục món ăn  
- Quản lý tài khoản nhân viên  
- Quản lý tài khoản khách hàng  
- Xem thống kê doanh thu và báo cáo nâng cao  

---

# 2. Nghiệp vụ xem menu và chọn món

Người dùng có thể xem menu món ăn mà **không cần đăng nhập**.

**Thông tin của một món ăn bao gồm:**

- Tên món  
- Hình ảnh  
- Mô tả  
- Giá  
- Danh mục  
- Trạng thái món (available / out_of_stock)  

Một món ăn có thể thuộc **nhiều danh mục khác nhau**.  
Ví dụ: gà rán có thể thuộc danh mục **gà** và **combo**.

Người dùng có thể:

- Tìm kiếm món ăn theo danh mục  
- Lọc món ăn theo giá  
- Xem chi tiết món ăn  

---

# 3. Nghiệp vụ giỏ hàng (Cart)

Khách hàng chọn món bằng cách **thêm món vào giỏ hàng**.

Trong giỏ hàng, khách hàng có thể:

- Xem danh sách món đã chọn  
- Thay đổi số lượng món  
- Xóa món khỏi giỏ hàng  
- Xem tổng tiền tạm tính  

Một đơn hàng có thể bao gồm **nhiều món ăn khác nhau**.

Khách hàng chỉ có thể đặt hàng khi:

- Đã đăng nhập  
- Giỏ hàng có ít nhất một món  

---

# 4. Nghiệp vụ đặt hàng (Order)

Khi khách hàng nhấn **đặt hàng**, hệ thống sẽ:

1. Tạo một đơn hàng mới  
2. Sao chép thông tin món ăn từ giỏ hàng sang đơn hàng  
3. Gán trạng thái đơn hàng ban đầu là **pending**

Khách hàng có thể:

- Chọn địa chỉ giao hàng đã lưu trước đó  
- Hoặc thêm địa chỉ giao hàng mới  

---

# 5. Nghiệp vụ thanh toán

Hệ thống hỗ trợ hai hình thức thanh toán:

## Thanh toán online (mô phỏng)

Thanh toán được mô phỏng trong hệ thống.

Nếu thanh toán thất bại:

- Hệ thống hiển thị thông báo thanh toán thất bại  
- Khách hàng có thể thanh toán lại  

Nếu thanh toán thất bại quá **3 lần**, hệ thống sẽ gợi ý khách hàng chuyển sang **thanh toán khi nhận hàng (COD)**.

Nếu khách hàng **không thanh toán trong vòng 3 phút**, đơn hàng sẽ tự động bị hủy.

---

## Thanh toán khi nhận hàng (COD)

Khách hàng thanh toán trực tiếp khi nhận món ăn.

---

# 6. Trạng thái đơn hàng

Một đơn hàng có thể có các trạng thái sau:
pending
confirmed
preparing
delivering
completed
cancelled

**Ý nghĩa của từng trạng thái:**


 pending: Đơn hàng vừa được tạo 
 confirmed: Nhân viên đã xác nhận đơn 
 preparing: Quán đang chuẩn bị món 
 delivering: Đơn hàng đang được giao 
 completed: Đơn hàng đã hoàn thành 
 cancelled: Đơn hàng bị hủy 

---

# 7. Quy tắc cập nhật trạng thái đơn hàng


 pending: Hệ thống 
 confirmed: Nhân viên 
 preparing: Nhân viên 
 delivering: Nhân viên 
 completed: Nhân viên hoặc hệ thống 
 cancelled: Hệ thống hoặc khách hàng 

---

# 8. Nghiệp vụ hủy đơn hàng

Khách hàng chỉ có thể hủy đơn hàng khi:
trạng thái đơn = confirmed
Nếu đơn hàng đã chuyển sang:
preparing
delivering
thì khách hàng **không thể hủy đơn hàng**.
Khi đơn hàng bị hủy, trạng thái đơn hàng sẽ chuyển sang:
cancelled
Khách hàng vẫn có thể xem đơn hàng này trong **lịch sử đặt hàng** và có thể đặt lại.
---

# 9. Nghiệp vụ quản lý món ăn
Quản lí có quyền:
- Thêm món ăn  
- Chỉnh sửa món ăn  
- Xóa món ăn khỏi menu  
Khi món ăn bị xóa khỏi menu:
- Món ăn sẽ **không còn hiển thị trên menu**
- Nhưng dữ liệu món ăn vẫn được giữ trong hệ thống
- Các đơn hàng cũ vẫn giữ thông tin món ăn
Nhân viên không được chỉnh sửa menu nhưng có thể:
cập nhật trạng thái món ăn
available / out_of_stock
---

# 10. Xử lý các tình huống đặc biệt
## Món ăn hết hàng
Nếu món ăn hết hàng, nhân viên có thể cập nhật trạng thái **out_of_stock** để món ăn không thể được đặt.
## Nhiều người đặt cùng lúc
Nếu một món ăn vừa hết hàng:
- Những đơn hàng đặt sau sẽ nhận thông báo **món ăn đã hết hàng**
## Mất kết nối internet
Nếu hệ thống phát hiện mất kết nối internet:
- Hiển thị thông báo  
- Yêu cầu người dùng kết nối lại  
---
# 11. Gợi ý món ăn
Hệ thống có thể gợi ý cho người dùng:
- Các món có giá tương đương  
- Các món bán chạy



## PHÂN TÍCH & THIẾT KẾ


1. Tổng quan hệ thống

Hệ thống Food Ordering System là một ứng dụng web cho phép khách hàng xem menu món ăn, đặt món và theo dõi trạng thái đơn hàng trực tuyến. Hệ thống được thiết kế nhằm hỗ trợ quá trình đặt món và quản lý đơn hàng của quán ăn một cách hiệu quả.
Người dùng chính của hệ thống bao gồm khách hàng, nhân viên và quản lí. Khách hàng sử dụng hệ thống để xem menu, thêm món vào giỏ hàng và đặt đơn hàng. Nhân viên chịu trách nhiệm xử lý các đơn hàng và cập nhật trạng thái đơn hàng. Quản lí có quyền quản trị hệ thống như quản lý menu, quản lý tài khoản và xem các thống kê bán hàng.
Hệ thống được xây dựng dưới dạng web application và dự kiến sử dụng các công nghệ web hiện đại để phát triển frontend, backend và cơ sở dữ liệu.

2. Phân tích người dùng (Actors)

Hệ thống bao gồm ba nhóm người dùng chính.
Khách hàng là người sử dụng hệ thống để xem menu món ăn, thêm món vào giỏ hàng, đặt món và theo dõi trạng thái đơn hàng. Khách hàng cũng có thể xem lịch sử đặt hàng của mình và hủy đơn hàng trong một số trường hợp nhất định.
Nhân viên là người xử lý các đơn hàng được tạo bởi khách hàng. Nhân viên có thể xem danh sách đơn hàng mới, xác nhận đơn hàng và cập nhật trạng thái của đơn hàng trong quá trình chuẩn bị và giao hàng.
Quản lí là người có quyền quản trị hệ thống. Quản lí có thể quản lý menu món ăn, chỉnh sửa thông tin món ăn, quản lý tài khoản nhân viên và khách hàng, đồng thời xem các thống kê về doanh thu và lịch sử bán hàng.

3. Thiết kế các module của hệ thống

Hệ thống được chia thành nhiều module để quản lý các chức năng khác nhau.
Module xác thực người dùng (Authentication Module) chịu trách nhiệm xử lý các chức năng đăng ký, đăng nhập và xác thực người dùng trong hệ thống.
Module quản lý người dùng (User Management Module) quản lý thông tin tài khoản của khách hàng, nhân viên và quản lí.
Module menu (Menu Module) hiển thị danh sách món ăn, chi tiết món ăn và hỗ trợ tìm kiếm hoặc lọc món ăn theo danh mục hoặc giá.
Module giỏ hàng (Cart Module) cho phép khách hàng thêm món ăn vào giỏ hàng, chỉnh sửa số lượng món và xem tổng giá trị của giỏ hàng trước khi đặt hàng.
Module đơn hàng (Order Module) chịu trách nhiệm tạo đơn hàng khi khách hàng thực hiện đặt món và lưu trữ thông tin các món ăn trong đơn hàng.
Module thanh toán (Payment Module) xử lý các phương thức thanh toán như thanh toán online (mô phỏng) hoặc thanh toán khi nhận hàng.
Module quản lý đơn hàng (Order Management Module) cho phép nhân viên xem các đơn hàng mới và cập nhật trạng thái đơn hàng trong quá trình xử lý.
Module thống kê và báo cáo (Reporting Module) hỗ trợ quản lí xem các báo cáo về doanh thu, số lượng đơn hàng và lịch sử bán hàng.

4. Thiết kế dữ liệu (Database Design)

Hệ thống sử dụng cơ sở dữ liệu để lưu trữ thông tin người dùng, món ăn, đơn hàng và các dữ liệu liên quan.
Bảng User lưu thông tin tài khoản của khách hàng, nhân viên và quản lí. Bảng Food lưu thông tin về các món ăn như tên món, mô tả, giá và trạng thái món ăn.
Bảng Category lưu các danh mục món ăn như gà, nước uống hoặc combo. Một món ăn có thể thuộc nhiều danh mục khác nhau, do đó hệ thống sử dụng bảng trung gian FoodCategory để lưu mối quan hệ giữa món ăn và danh mục.
Bảng Cart và CartItem lưu thông tin giỏ hàng của người dùng và các món ăn trong giỏ hàng.
Bảng Order lưu thông tin của mỗi đơn hàng, bao gồm người đặt, địa chỉ giao hàng, tổng tiền và trạng thái đơn hàng. Bảng OrderItem lưu chi tiết các món ăn trong từng đơn hàng.
Ngoài ra, hệ thống còn có bảng Address để lưu địa chỉ giao hàng của khách hàng và bảng Payment để lưu thông tin thanh toán của đơn hàng.

5. Luồng nghiệp vụ chính của hệ thống

Luồng hoạt động chính của hệ thống bắt đầu khi người dùng truy cập vào hệ thống và xem danh sách món ăn trong menu. Người dùng có thể thêm các món ăn vào giỏ hàng và chỉnh sửa giỏ hàng trước khi đặt hàng.
Sau khi hoàn tất việc chọn món, khách hàng tiến hành đặt hàng. Hệ thống sẽ tạo một đơn hàng mới với trạng thái ban đầu là pending. Khách hàng có thể chọn phương thức thanh toán online hoặc thanh toán khi nhận hàng.
Sau khi đơn hàng được tạo, nhân viên sẽ xem danh sách đơn hàng mới và xác nhận đơn hàng. Trong quá trình xử lý, nhân viên sẽ cập nhật trạng thái đơn hàng từ confirmed sang preparing, delivering và cuối cùng là completed khi đơn hàng được giao thành công.
Trong một số trường hợp, đơn hàng có thể bị hủy và chuyển sang trạng thái cancelled.


## KẾ HOẠCH

### MVP

1. Mô tả các chức năng của sản phẩm MVP

MVP (Minimum Viable Product) là phiên bản sản phẩm tối thiểu nhưng vẫn có đầy đủ các chức năng cốt lõi để hệ thống có thể hoạt động. Đối với hệ thống Food Ordering System, phiên bản MVP sẽ tập trung vào các chức năng chính như xem menu, đặt món, quản lý đơn hàng và cập nhật trạng thái đơn hàng.

Hệ thống cho phép người dùng đăng ký tài khoản và đăng nhập vào hệ thống. Sau khi đăng nhập, khách hàng có thể xem danh sách các món ăn trong menu, xem chi tiết món ăn và thêm món ăn vào giỏ hàng. Người dùng có thể chỉnh sửa số lượng món ăn hoặc xóa món ăn khỏi giỏ hàng trước khi tiến hành đặt hàng.

Khi khách hàng hoàn tất việc chọn món, hệ thống cho phép khách hàng tạo đơn hàng và lựa chọn phương thức thanh toán. Hệ thống hỗ trợ hai phương thức thanh toán là thanh toán online (mô phỏng) và thanh toán khi nhận hàng.

Sau khi đơn hàng được tạo, nhân viên có thể xem danh sách đơn hàng mới và xác nhận đơn hàng. Nhân viên có thể cập nhật trạng thái của đơn hàng trong các giai đoạn khác nhau như preparing, delivering và completed.

Ngoài ra, quản lí có thể quản lý menu món ăn bằng cách thêm món mới, chỉnh sửa thông tin món ăn hoặc xóa món ăn khỏi menu. Quản lí cũng có thể xem thống kê đơn hàng và lịch sử bán hàng.

Những chức năng trên được xem là các chức năng cốt lõi của hệ thống và được triển khai trong phiên bản MVP.

2. Kế hoạch kiểm thử (Testing Plan)

Kế hoạch kiểm thử được xây dựng nhằm đảm bảo hệ thống hoạt động đúng theo yêu cầu và các chức năng hoạt động ổn định.

Trước tiên, hệ thống sẽ được kiểm thử chức năng đăng ký và đăng nhập để đảm bảo người dùng có thể tạo tài khoản và truy cập hệ thống một cách bình thường. Sau đó, chức năng xem menu và tìm kiếm món ăn sẽ được kiểm thử để đảm bảo người dùng có thể xem danh sách món ăn và thông tin chi tiết của từng món.

Chức năng giỏ hàng cũng sẽ được kiểm thử để đảm bảo người dùng có thể thêm món ăn vào giỏ hàng, chỉnh sửa số lượng món và xóa món khỏi giỏ hàng. Sau đó, chức năng đặt hàng sẽ được kiểm thử để đảm bảo hệ thống có thể tạo đơn hàng đúng với thông tin món ăn mà người dùng đã chọn.

Chức năng thanh toán cũng cần được kiểm thử để đảm bảo hệ thống xử lý đúng các trường hợp thanh toán thành công hoặc thất bại. Ngoài ra, hệ thống cần được kiểm thử để đảm bảo đơn hàng sẽ tự động bị hủy nếu khách hàng không thanh toán trong thời gian quy định.

Đối với nhân viên, hệ thống sẽ được kiểm thử chức năng xem danh sách đơn hàng và cập nhật trạng thái đơn hàng. Cuối cùng, các chức năng quản lý menu và thống kê của quản lí cũng sẽ được kiểm thử để đảm bảo hệ thống hoạt động đúng với các quyền của từng vai trò.

Việc kiểm thử sẽ bao gồm kiểm thử chức năng (functional testing) để đảm bảo các chức năng hoạt động đúng và kiểm thử giao diện để đảm bảo hệ thống dễ sử dụng đối với người dùng.

3. Các chức năng dự kiến phát triển trong phase tiếp theo

Sau khi phiên bản MVP được hoàn thành, hệ thống có thể được mở rộng với nhiều chức năng nâng cao hơn trong các giai đoạn tiếp theo.

Trong phase tiếp theo, hệ thống có thể bổ sung chức năng gợi ý món ăn dựa trên các món bán chạy hoặc dựa trên lịch sử đặt hàng của người dùng. Điều này giúp cải thiện trải nghiệm của khách hàng khi sử dụng hệ thống.

Ngoài ra, hệ thống có thể được tích hợp với các cổng thanh toán thực tế để hỗ trợ thanh toán trực tuyến thay vì chỉ mô phỏng thanh toán như trong phiên bản MVP.

Hệ thống cũng có thể bổ sung chức năng đánh giá và nhận xét món ăn để khách hàng có thể chia sẻ trải nghiệm của mình với các người dùng khác. Chức năng thông báo đơn hàng theo thời gian thực cũng có thể được phát triển để giúp khách hàng cập nhật trạng thái đơn hàng nhanh chóng hơn.

Ngoài ra, hệ thống có thể phát triển thêm chức năng quản lý khuyến mãi và giảm giá để hỗ trợ các chương trình marketing của cửa hàng.

Các chức năng này không bắt buộc phải có trong phiên bản MVP nhưng sẽ giúp hệ thống hoàn thiện hơn và mang lại nhiều giá trị hơn cho người dùng trong các phiên bản tiếp theo.

### Beta Version
- Kết quả kiểm thử
- Viết báo cáo
- Thời hạn hoàn thành dự kiến: ... (Chậm nhất 10.05.2026)

## CÂU HỎI


Liệt kê các câu hỏi của bạn cho thầy ở đây:

- ...
- ...

---
