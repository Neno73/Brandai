import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  throw new Error('RESEND_API_KEY is required')
}

const resend = new Resend(apiKey)

export interface SendMerchandiseEmailParams {
  to: string
  sessionId: string
  brandName: string
  concept: string
  pdfUrl: string
  previewImages: string[]
}

/**
 * Send merchandise design PDF to user
 */
export async function sendMerchandiseEmail({
  to,
  sessionId,
  brandName,
  concept,
  pdfUrl,
  previewImages,
}: SendMerchandiseEmailParams): Promise<void> {
  const previewImageHtml = previewImages
    .slice(0, 3)
    .map(
      (url) =>
        `<img src="${url}" alt="Product preview" style="width: 200px; height: 200px; object-fit: cover; margin: 10px; border-radius: 8px;" />`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Brand Merchandise Designs</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Your Designs Are Ready!</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi there! 👋
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We've created custom merchandise designs for <strong>${brandName}</strong> based on your brand's unique identity.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Design Concept</h3>
      <p style="margin-bottom: 0;">${concept}</p>
    </div>

    <h3 style="color: #333; margin-top: 30px;">Preview</h3>
    <div style="text-align: center; margin: 20px 0;">
      ${previewImageHtml}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${pdfUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
        📥 Download Your Designs (PDF)
      </a>
    </div>

    <div style="background: #fffbea; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>💡 Next Steps:</strong><br>
        • Review the designs and concept<br>
        • Share with your team for feedback<br>
        • Use the mockups to visualize your brand merchandise<br>
        • Contact your print vendor with the specifications
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
      Session ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${sessionId}</code>
    </p>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Questions or feedback? Reply to this email - we'd love to hear from you!
    </p>

    <p style="font-size: 14px; color: #999; margin-top: 20px; text-align: center;">
      BrendAI - Automated Brand Merchandise Design<br>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
    </p>
  </div>
</body>
</html>
  `.trim()

  const { error } = await resend.emails.send({
    from: 'BrendAI <noreply@brendai.com>',
    to,
    subject: `🎨 Your ${brandName} Merchandise Designs Are Ready!`,
    html,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

/**
 * Send magic link for session access
 */
export async function sendMagicLink(
  to: string,
  magicLink: string,
  brandName?: string
): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Your Designs</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Access Your Designs</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi there! 👋
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      ${brandName ? `Your merchandise designs for <strong>${brandName}</strong> are in progress!` : 'Your merchandise designs are being created!'}
    </p>

    <p style="font-size: 16px; margin-bottom: 30px;">
      Click the button below to view the current status and access your designs when they're ready.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
        🎨 View My Designs
      </a>
    </div>

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #78350f;">
        <strong>⚠️ Security Notice:</strong><br>
        This link is unique to you and expires in 24 hours. Don't share it with others.
      </p>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If you didn't request this, you can safely ignore this email.
    </p>

    <p style="font-size: 14px; color: #999; margin-top: 30px; text-align: center;">
      BrendAI - Automated Brand Merchandise Design<br>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #667eea; text-decoration: none;">Visit our website</a>
    </p>
  </div>
</body>
</html>
  `.trim()

  const { error } = await resend.emails.send({
    from: 'BrendAI <noreply@brendai.com>',
    to,
    subject: brandName
      ? `🔐 Access Your ${brandName} Designs`
      : '🔐 Access Your Merchandise Designs',
    html,
  })

  if (error) {
    throw new Error(`Failed to send magic link: ${error.message}`)
  }
}
