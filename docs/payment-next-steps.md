# Payment And Download Follow-Up

Ghi chú tạm cho luồng bán hàng số:

- Test lại một đơn SePay mới giá nhỏ sau khi đã sửa trigger `create_licenses_on_order_paid`.
- Chuyển file tải thật sang Supabase Storage private bucket khi bắt đầu làm bảo mật download.
- API download nên kiểm tra `licenses`, giới hạn lượt tải, log download rồi tạo signed URL 30 phút.
- Email sau thanh toán nên trỏ về `/profile/downloads`, không gửi link file trực tiếp.
- Sau khi bật signed URL, Cloudinary chỉ dùng cho ảnh sản phẩm/demo, không dùng cho file ZIP bán hàng.
