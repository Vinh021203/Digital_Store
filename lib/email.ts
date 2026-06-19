// lib/email.ts
// Email service using Resend for sending transactional emails

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.shopwebre.vn').replace(/\/$/, '');

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
}

export interface OrderEmailData {
    orderId: number;
    customerEmail: string;
    customerName: string;
    items: Array<{
        productName: string;
        licenseType: string;
        price: number;
        licenseKey?: string;
    }>;
    total: number;
    discount?: number;
}

export interface LicenseEmailData {
    customerEmail: string;
    customerName: string;
    productName: string;
    licenseKey: string;
    licenseType: string;
    downloadUrl: string;
}

export interface NewVersionEmailData {
    customerEmail: string;
    customerName: string;
    productName: string;
    newVersion: string;
    changelog?: string;
    downloadUrl: string;
}

export async function sendEmail(options: EmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: `Shop Web rẻ <${FROM_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            replyTo: options.replyTo,
        });

        if (error) {
            console.error('Email send error:', error);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>${item.productName}</strong>
                <br><span style="color: #666; font-size: 13px;">${item.licenseType} License</span>
                ${item.licenseKey ? `<br><code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${item.licenseKey}</code>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                ${item.price.toLocaleString('vi-VN')}đ
            </td>
        </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Cảm ơn bạn đã mua hàng!</h1>
            </div>

            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #333;">
                    Xin chào <strong>${data.customerName}</strong>,
                </p>
                <p style="color: #666;">
                    Đơn hàng <strong>#${data.orderId}</strong> của bạn đã được xác nhận.
                    Dưới đây là chi tiết đơn hàng và license key của bạn:
                </p>

                <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                    <thead>
                        <tr style="background: #f8f8f8;">
                            <th style="padding: 12px; text-align: left; font-weight: 600;">Sản phẩm</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600;">Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        ${data.discount ? `
                        <tr>
                            <td style="padding: 12px; text-align: right;">Giảm giá:</td>
                            <td style="padding: 12px; text-align: right; color: #22c55e;">-${data.discount.toLocaleString('vi-VN')}đ</td>
                        </tr>
                        ` : ''}
                        <tr style="background: #f8f8f8;">
                            <td style="padding: 12px; text-align: right;"><strong>Tổng cộng:</strong></td>
                            <td style="padding: 12px; text-align: right; font-size: 18px; color: #f97316;"><strong>${data.total.toLocaleString('vi-VN')}đ</strong></td>
                        </tr>
                    </tfoot>
                </table>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${SITE_URL}/profile/downloads"
                       style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Tải xuống ngay
                    </a>
                </div>

                <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                        <strong>Lưu ý:</strong> Hãy lưu lại license key để sử dụng khi cần hỗ trợ.
                        Bạn có thể xem lại license key trong mục <a href="${SITE_URL}/profile/licenses" style="color: #f97316;">Licenses</a>.
                    </p>
                </div>
            </div>

            <div style="background: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Cần hỗ trợ? <a href="${SITE_URL}/profile/support" style="color: #f97316;">Liên hệ chúng tôi</a>
                </p>
                <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                    © 2026 Shop Web rẻ. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: data.customerEmail,
        subject: `Đơn hàng #${data.orderId} đã được xác nhận`,
        html,
    });
}

export async function sendLicenseDeliveryEmail(data: LicenseEmailData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">License key của bạn</h1>
            </div>

            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #333;">
                    Xin chào <strong>${data.customerName}</strong>,
                </p>
                <p style="color: #666;">
                    Đây là license key cho sản phẩm <strong>${data.productName}</strong>:
                </p>

                <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 8px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">License Key</p>
                    <code style="font-size: 24px; font-weight: bold; color: #166534; letter-spacing: 2px;">${data.licenseKey}</code>
                    <p style="margin: 12px 0 0; color: #666; font-size: 13px;">
                        Loại: <strong>${data.licenseType}</strong>
                    </p>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${data.downloadUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold;">
                        Tải xuống sản phẩm
                    </a>
                </div>
            </div>

            <div style="background: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                    © 2026 Shop Web rẻ. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: data.customerEmail,
        subject: `License Key: ${data.productName}`,
        html,
    });
}

export async function sendNewVersionEmail(data: NewVersionEmailData) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Phiên bản mới đã sẵn sàng!</h1>
            </div>

            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #333;">
                    Xin chào <strong>${data.customerName}</strong>,
                </p>
                <p style="color: #666;">
                    Sản phẩm <strong>${data.productName}</strong> vừa được cập nhật lên phiên bản <strong>v${data.newVersion}</strong>.
                </p>

                ${data.changelog ? `
                <div style="background: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 8px; font-weight: bold; color: #5b21b6;">Những điểm mới:</p>
                    <p style="margin: 0; color: #666; white-space: pre-line;">${data.changelog}</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${data.downloadUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold;">
                        Tải phiên bản mới
                    </a>
                </div>
            </div>

            <div style="background: #f8f8f8; padding: 24px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                    © 2026 Shop Web rẻ. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: data.customerEmail,
        subject: `Cập nhật mới: ${data.productName} v${data.newVersion}`,
        html,
    });
}
