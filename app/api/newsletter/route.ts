import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getSiteUrl } from '@/lib/site-url';
import { checkDistributedRateLimit, getClientIp, getRetryAfterSeconds } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = await checkDistributedRateLimit(`newsletter:${clientIp}`, {
      windowMs: 60 * 60 * 1000,
      max: 3,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Bạn đã đăng ký quá nhanh. Vui lòng thử lại sau.' },
        { status: 429, headers: { 'Retry-After': String(getRetryAfterSeconds(rateLimit.resetAt)) } },
      );
    }

    const payload = await request.json();
    const email = String(payload.email || '').trim().toLowerCase().slice(0, 160);

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ success: false, message: 'Email không hợp lệ.' }, { status: 400 });
    }

    const siteUrl = getSiteUrl();
    const ebookUrl = process.env.NEWSLETTER_EBOOK_URL?.trim();
    const safeEbookUrl = ebookUrl ? escapeHtml(ebookUrl) : '';
    const html = `
      <!doctype html>
      <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
        <body style="margin:0;background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #e2e8f0;border-radius:22px;background:#fff;box-shadow:0 18px 45px rgba(15,23,42,.08);">
            <div style="padding:32px 30px;text-align:center;background:#f97316;color:#fff;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#ffedd5;">Quà tặng từ Web Giá Rẻ</p>
              <h1 style="margin:0;font-size:27px;line-height:1.3;font-weight:900;">Ebook Kỹ năng tự học vượt trội</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#fff7ed;">Cảm ơn bạn đã đăng ký nhận tài nguyên kiến thức.</p>
            </div>
            <div style="padding:30px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#334155;">Xin chào,</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#475569;">Ebook của bạn đã sẵn sàng. Chúng tôi cũng gửi tặng mã ưu đãi <strong style="color:#ea580c;">20%</strong> cho lần tư vấn đầu tiên.</p>
              ${safeEbookUrl ? `<div style="margin:26px 0;text-align:center;"><a href="${safeEbookUrl}" style="display:inline-block;border-radius:12px;background:#f97316;padding:14px 24px;color:#fff;text-decoration:none;font-size:15px;font-weight:900;">Tải Ebook miễn phí</a></div>` : `<div style="margin:24px 0;border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;padding:16px;color:#9a3412;font-size:14px;line-height:1.6;">Ebook đang được hoàn thiện đường dẫn tải. Chúng tôi sẽ gửi bổ sung vào email này.</div>`}
              <div style="border:2px dashed #fdba74;border-radius:16px;background:#fff7ed;padding:20px;text-align:center;">
                <p style="margin:0 0 7px;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#c2410c;">Mã ưu đãi của bạn</p>
                <div style="font-family:monospace;font-size:29px;font-weight:900;letter-spacing:.12em;color:#0f172a;">BOOK20</div>
              </div>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#64748b;">Cần hỗ trợ? <a href="${escapeHtml(siteUrl)}/contact" style="color:#ea580c;font-weight:700;text-decoration:none;">Liên hệ Web Giá Rẻ</a>.</p>
            </div>
            <div style="border-top:1px solid #e2e8f0;background:#f8fafc;padding:18px 30px;text-align:center;font-size:12px;color:#64748b;">Email riêng dành cho chương trình tặng Ebook, không phải email phản hồi liên hệ.</div>
          </div>
        </body>
      </html>`;

    await sendEmail({ to: email, subject: 'Ebook miễn phí và mã ưu đãi BOOK20', html });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter email error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Không gửi được email.' }, { status: 500 });
  }
}
