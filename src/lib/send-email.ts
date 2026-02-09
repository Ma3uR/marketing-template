import { createServiceClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { replaceTemplateVariables, TemplateVariables } from '@/lib/email-templates';
import type { EmailTemplate } from '@/types/database';

interface SendTemplatedEmailParams {
  templateSlug: string;
  to: string;
  variables: TemplateVariables;
}

export async function sendTemplatedEmail({
  templateSlug,
  to,
  variables,
}: SendTemplatedEmailParams) {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('slug', templateSlug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error(`Template "${templateSlug}" not found or inactive`);
    return null;
  }

  const template = data as unknown as EmailTemplate;
  const subject = replaceTemplateVariables(template.subject, variables);
  const html = replaceTemplateVariables(template.body_html, variables);

  return sendEmail({ to, subject, html });
}

interface PurchaseConfirmationParams {
  to: string;
  customerName: string;
  productName: string;
  amount: number;
  currency: string;
  orderReference: string;
}

export async function sendPurchaseConfirmationEmail({
  to,
  customerName,
  productName,
  amount,
  currency,
  orderReference,
}: PurchaseConfirmationParams) {
  return sendTemplatedEmail({
    templateSlug: 'purchase_confirmation',
    to,
    variables: {
      customer_name: customerName,
      product_name: productName,
      amount: amount.toString(),
      currency,
      order_reference: orderReference,
    },
  });
}
