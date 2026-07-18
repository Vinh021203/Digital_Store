import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.RESEND_CONTACT_EMAIL || 'contact@webgiare.id.vn';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const subject = String(payload.subject || '').trim();
    const message = String(payload.message || '').trim();
    const productName = String(payload.productName || '').trim();
    const productUrl = String(payload.productUrl || '').trim();
    const productImage = String(payload.productImage || '').trim();
    const productFormat = String(payload.productFormat || '').trim();
    const projectNeed = String(payload.projectNeed || '').trim();
    const techPreference = String(payload.techPreference || '').trim();
    const budget = String(payload.budget || '').trim();
    const timeline = String(payload.timeline || '').trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc.' },
        { status: 400 }
      );
    }

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:680px;margin:0 auto;border-radius:22px;overflow:hidden;background:#ffffff;border:1px solid #e2e8f0;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
            <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 30px;color:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#ffedd5;">Web Giá Rẻ - Portfolio</p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:900;">Yêu cầu tư vấn mới</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#fff7ed;">Khách vừa gửi nhu cầu tư vấn giao diện website, landing page hoặc dự án web.</p>
            </div>

            <div style="padding:26px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:22px;">
                <tr>
                  <td style="padding:14px 16px;border:1px solid #e2e8f0;border-radius:14px;background:#fff7ed;">
                    <p style="margin:0 0 5px;font-size:12px;font-weight:800;text-transform:uppercase;color:#c2410c;">Người gửi</p>
                    <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">${escapeHtml(name)}</p>
                    <p style="margin:6px 0 0;font-size:14px;color:#475569;"><a href="mailto:${escapeHtml(email)}" style="color:#ea580c;text-decoration:none;font-weight:700;">${escapeHtml(email)}</a></p>
                  </td>
                </tr>
              </table>

              <div style="border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;margin-bottom:22px;">
                ${productImage ? `
                  <img src="${escapeHtml(productImage)}" alt="${escapeHtml(productName || 'Mẫu demo')}" style="display:block;width:100%;max-height:260px;object-fit:cover;background:#f1f5f9;" />
                ` : ''}
                <div style="padding:18px 18px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;">Mẫu demo quan tâm</p>
                  <h2 style="margin:0;font-size:20px;line-height:1.35;color:#0f172a;">${escapeHtml(productName || 'Tư vấn chung / chưa chọn mẫu')}</h2>
                  ${productFormat ? `<p style="margin:9px 0 0;display:inline-block;border-radius:999px;background:#f1f5f9;padding:6px 10px;font-size:12px;font-weight:800;color:#334155;">${escapeHtml(productFormat)}</p>` : ''}
                  ${productUrl ? `<p style="margin:14px 0 0;"><a href="${escapeHtml(productUrl)}" style="display:inline-block;border-radius:10px;background:#0f172a;padding:10px 14px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;">Mở trang mẫu demo</a></p>` : ''}
                </div>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;margin-bottom:22px;">
                ${[
                  ['Nhu cầu triển khai', projectNeed],
                  ['Công nghệ mong muốn', techPreference],
                  ['Ngân sách dự kiến', budget],
                  ['Thời gian cần hoàn thiện', timeline],
                ].map(([label, value]) => `
                  <tr>
                    <td style="width:190px;padding:12px 14px;border:1px solid #e2e8f0;border-right:0;border-radius:12px 0 0 12px;background:#f8fafc;font-size:13px;font-weight:800;color:#475569;">${label}</td>
                    <td style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:0 12px 12px 0;background:#ffffff;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(value || 'Chưa cung cấp')}</td>
                  </tr>
                `).join('')}
              </table>

              <div style="border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;padding:18px 20px;">
                <p style="margin:0 0 10px;font-size:12px;font-weight:900;text-transform:uppercase;color:#c2410c;">Ghi chú thêm</p>
                <p style="margin:0;white-space:pre-line;font-size:15px;line-height:1.75;color:#1e293b;">${escapeHtml(message)}</p>
              </div>
            </div>

            <div style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#64748b;">Email này được gửi tự động từ form liên hệ Web Giá Rẻ - Portfolio. Hãy phản hồi trực tiếp vào email của khách để tiếp tục trao đổi.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: CONTACT_EMAIL,
      subject,
      html,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact email error:', error);
    const message = error instanceof Error ? error.message : 'Không gửi được email.';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
