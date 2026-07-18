import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);
const inboundAddress = (
  process.env.RESEND_INBOUND_ADDRESS || 'contact@webgiare.id.vn'
).toLowerCase();

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function htmlToText(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const forwardTo =
    process.env.RESEND_INBOUND_FORWARD_TO || process.env.CONTACT_EMAIL;
  const forwardFrom =
    process.env.RESEND_FROM_EMAIL || 'contact@webgiare.id.vn';

  if (!process.env.RESEND_API_KEY || !webhookSecret || !forwardTo) {
    console.error('Resend inbound webhook is missing required environment variables.');
    return NextResponse.json(
      { error: 'Inbound email forwarding is not configured.' },
      { status: 500 }
    );
  }

  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signature = request.headers.get('svix-signature');

  if (!id || !timestamp || !signature) {
    return NextResponse.json(
      { error: 'Missing webhook signature headers.' },
      { status: 400 }
    );
  }

  const payload = await request.text();
  let event;

  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch (error) {
    console.error('Resend inbound signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.', stage: 'verification' },
      { status: 401 }
    );
  }

  try {
    if (event.type !== 'email.received') {
      return NextResponse.json({ received: true });
    }

    const isIntendedRecipient = event.data.to.some(
      (address) => address.toLowerCase() === inboundAddress
    );

    // Resend accepts mail for every address at the receiving domain. Forward
    // only the public contact inbox so arbitrary aliases cannot consume quota.
    if (!isIntendedRecipient) {
      return NextResponse.json({ received: true, forwarded: false });
    }

    const { data: receivedEmail, error: receiveError } =
      await resend.emails.receiving.get(event.data.email_id);

    if (receiveError || !receivedEmail) {
      throw new Error(receiveError?.message || 'Could not retrieve inbound email.');
    }

    const bodyText =
      receivedEmail.text ||
      htmlToText(receivedEmail.html || '') ||
      'Email không có nội dung văn bản.';

    const attachmentPayload: Array<{
      filename: string;
      content: string;
      content_type: string;
      content_id?: string;
    }> = [];
    if (event.data.attachments.length > 0) {
      const { data: attachmentList, error: attachmentError } =
        await resend.emails.receiving.attachments.list({
          emailId: event.data.email_id,
        });

      if (attachmentError) {
        throw new Error(attachmentError.message);
      }

      for (const attachment of attachmentList?.data || []) {
        const response = await fetch(attachment.download_url);
        if (!response.ok) {
          throw new Error(`Could not download attachment: ${attachment.filename || attachment.id}`);
        }

        attachmentPayload.push({
          filename: attachment.filename || 'attachment',
          content: Buffer.from(await response.arrayBuffer()).toString('base64'),
          content_type: attachment.content_type,
          content_id: attachment.content_id,
        });
      }
    }

    const originalSender = receivedEmail.reply_to?.[0] || event.data.from;
    const safeSender = escapeHtml(event.data.from);
    const safeRecipient = escapeHtml(event.data.to.join(', '));
    const safeSubject = escapeHtml(event.data.subject || '(Không có tiêu đề)');
    const safeBody = escapeHtml(bodyText).replace(/\n/g, '<br />');

    const html = `
      <!doctype html>
      <html>
        <body style="margin:0;background:#f1f5f9;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:0 auto;border-collapse:collapse;background:#ffffff;border:1px solid #cbd5e1;">
            <tr><td style="height:6px;background:#f97316;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:28px 32px;background:#0f172a;color:#ffffff;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fdba74;">Web Giá Rẻ · Hộp thư liên hệ</p>
                <h1 style="margin:0;font-size:25px;line-height:1.3;font-weight:800;">Thư liên hệ mới</h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">Email được gửi trực tiếp tới contact@webgiare.id.vn</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #cbd5e1;margin-bottom:24px;">
                  <tr><td style="width:130px;padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;color:#475569;">NGƯỜI GỬI</td><td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;">${safeSender}</td></tr>
                  <tr><td style="width:130px;padding:11px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;color:#475569;">GỬI TỚI</td><td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;">${safeRecipient}</td></tr>
                  <tr><td style="width:130px;padding:11px 14px;background:#f8fafc;font-size:12px;font-weight:800;color:#475569;">TIÊU ĐỀ</td><td style="padding:11px 14px;font-size:14px;font-weight:700;">${safeSubject}</td></tr>
                </table>
                <div style="border-left:4px solid #f97316;background:#fff7ed;padding:20px 22px;font-size:15px;line-height:1.75;color:#1e293b;">${safeBody}</div>
                ${attachmentPayload.length > 0 ? `<p style="margin:18px 0 0;font-size:12px;color:#64748b;">Có ${attachmentPayload.length} tệp đính kèm được chuyển cùng email này.</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;line-height:1.6;color:#64748b;">Bấm Trả lời để phản hồi trực tiếp tới người gửi ban đầu.</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: `Web Giá Rẻ - Portfolio <${forwardFrom}>`,
      to: forwardTo,
      replyTo: originalSender,
      subject: `[Thư liên hệ] ${event.data.subject || '(Không có tiêu đề)'}`,
      html,
      text: bodyText,
      attachments: attachmentPayload,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      received: true,
      forwarded: true,
      id: data?.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown forwarding error';
    console.error('Resend inbound forwarding failed:', error);
    return NextResponse.json(
      { error: message, stage: 'forwarding' },
      { status: 502 }
    );
  }
}
