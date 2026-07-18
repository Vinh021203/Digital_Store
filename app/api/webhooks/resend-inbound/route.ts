import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);
const inboundAddress = (
  process.env.RESEND_INBOUND_ADDRESS || 'contact@webgiare.id.vn'
).toLowerCase();

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

  try {
    const payload = await request.text();
    const event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });

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

    const { data, error } = await resend.emails.receiving.forward({
      emailId: event.data.email_id,
      from: `Web Giá Rẻ - Portfolio <${forwardFrom}>`,
      to: forwardTo,
      passthrough: true,
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
    console.error('Resend inbound webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid webhook or email forwarding failed.' },
      { status: 400 }
    );
  }
}
