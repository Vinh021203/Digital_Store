// lib/sepay.ts
// SePay Payment Integration - VietQR Standard

// ============================================
// Types
// ============================================
export interface SepayConfig {
    bankCode: string;      // Mã ngân hàng (970422 = MBBank)
    bankName: string;      // Tên ngân hàng
    accountNumber: string; // Số tài khoản
    accountName: string;   // Tên chủ tài khoản
}

export interface PaymentRequest {
    orderId: number;
    amount: number;
    description?: string;
}

export interface QRCodeData {
    qrDataUrl: string;     // VietQR URL
    amount: number;
    description: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    expireAt: Date;
}

// ============================================
// SePay Configuration
// ============================================
export function getSepayConfig(): SepayConfig {
    return {
        bankCode: process.env.SEPAY_BANK_CODE || '970422',
        bankName: process.env.SEPAY_BANK_NAME || 'MBBank',
        accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '',
        accountName: process.env.SEPAY_ACCOUNT_NAME || '',
    };
}

// ============================================
// Generate VietQR URL (Standard format)
// ============================================
export function generateVietQRUrl(
    bankCode: string,
    accountNumber: string,
    amount: number,
    description: string,
    accountName?: string
): string {
    // VietQR standard format
    // https://img.vietqr.io/image/{bankCode}-{accountNumber}-{template}.png?amount={amount}&addInfo={description}&accountName={accountName}
    const template = 'compact2'; // compact, compact2, qr_only, print
    const encodedDesc = encodeURIComponent(description);
    const encodedName = encodeURIComponent(accountName || '');

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

// ============================================
// Create Payment QR Code
// ============================================
export function createPaymentQR(request: PaymentRequest): QRCodeData {
    const config = getSepayConfig();

    // Generate unique payment description with order ID for tracking
    const description = request.description || `DM${request.orderId}`;

    // Generate QR URL
    const qrDataUrl = generateVietQRUrl(
        config.bankCode,
        config.accountNumber,
        request.amount,
        description,
        config.accountName
    );

    // QR expires in 15 minutes
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + 15);

    return {
        qrDataUrl,
        amount: request.amount,
        description,
        accountNumber: config.accountNumber,
        accountName: config.accountName,
        bankName: config.bankName,
        expireAt,
    };
}

// ============================================
// Verify Webhook Signature
// ============================================
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    // In production, use crypto to verify HMAC signature
    // For now, simple comparison
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
}

// ============================================
// Parse SePay Webhook Payload
// ============================================
export interface SepayWebhookPayload {
    id: number;
    gateway: string;
    transactionDate: string;
    accountNumber: string;
    code: string | null;
    content: string;           // Nội dung chuyển khoản
    transferType: 'in' | 'out';
    transferAmount: number;
    accumulated: number;
    subAccount: string | null;
    referenceCode: string;
    description: string;
}

export function parseWebhookPayload(body: any): SepayWebhookPayload | null {
    try {
        return {
            id: body.id,
            gateway: body.gateway,
            transactionDate: body.transactionDate,
            accountNumber: body.accountNumber,
            code: body.code,
            content: body.content || '',
            transferType: body.transferType,
            transferAmount: body.transferAmount,
            accumulated: body.accumulated,
            subAccount: body.subAccount,
            referenceCode: body.referenceCode,
            description: body.description || '',
        };
    } catch {
        return null;
    }
}

// ============================================
// Extract Order ID from Payment Content
// ============================================
export function extractOrderIdFromContent(content: string): number | null {
    // Look for DM{orderId} pattern in payment content
    // e.g., "DM123" -> 123
    const match = content.match(/DM(\d+)/i);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}

// ============================================
// Format Amount for Display
// ============================================
export function formatAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}
