import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { ScanResult } from '@/lib/types'

const TO_EMAIL = 'djlangrish@gmail.com'

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function formatScore(score: number, max: number): string {
  return `${score}/${max}`
}

function buildScanSummaryHtml(scan: ScanResult): string {
  const criticalAndNeeds = [
    ...scan.checks.findable,
    ...scan.checks.quotable,
    ...scan.checks.understandable,
    ...scan.checks.trustworthy,
  ].filter(c => c.status === 'critical' || c.status === 'needs_work')

  const issueRows = criticalAndNeeds.map(c => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a0a0a;color:#e0e0e0;font-size:13px;">${c.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a0a0a;">
        <span style="background:${c.status === 'critical' ? '#7f1d1d' : '#431407'};color:${c.status === 'critical' ? '#fca5a5' : '#fdba74'};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;">
          ${c.status === 'critical' ? 'Critical' : 'Needs Work'}
        </span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a0a0a;color:#aaa;font-size:12px;">${c.detail}</td>
    </tr>
  `).join('')

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px;background:#1a0808;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#2a0a0a;">
          <th style="padding:10px 12px;text-align:left;color:#e74c3c;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Check</th>
          <th style="padding:10px 12px;text-align:left;color:#e74c3c;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Status</th>
          <th style="padding:10px 12px;text-align:left;color:#e74c3c;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Detail</th>
        </tr>
      </thead>
      <tbody>${issueRows}</tbody>
    </table>
  `
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; phone?: string; scan?: ScanResult }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, phone, scan } = body
  if (!email || !phone || !scan) {
    return NextResponse.json({ error: 'Email, phone and scan are required' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM_EMAIL = process.env.FROM_EMAIL || 'Rebel Scanner <onboarding@resend.dev>'
  const domain = getDomain(scan.url)

  // Email to Dan
  const danEmailHtml = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0c0c0c;padding:32px;max-width:680px;margin:0 auto;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="color:#e74c3c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">NEW LEAD — REBEL AI SCANNER</span>
        <h1 style="color:#fff;font-size:24px;margin:8px 0 0;font-family:'Space Grotesk',sans-serif;text-transform:uppercase;">${domain}</h1>
      </div>

      <div style="background:#160c0c;border:1px solid rgba(192,57,43,0.3);border-radius:10px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#e74c3c;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Contact Details</h2>
        <p style="color:#e0e0e0;margin:4px 0;font-size:14px;"><strong style="color:#fff;">Name:</strong> ${name || '(not provided)'}</p>
        <p style="color:#e0e0e0;margin:4px 0;font-size:14px;"><strong style="color:#fff;">Email:</strong> <a href="mailto:${email}" style="color:#e74c3c;">${email}</a></p>
        <p style="color:#e0e0e0;margin:4px 0;font-size:14px;"><strong style="color:#fff;">Phone:</strong> ${phone}</p>
        <p style="color:#e0e0e0;margin:4px 0;font-size:14px;"><strong style="color:#fff;">URL scanned:</strong> <a href="${scan.url}" style="color:#e74c3c;">${scan.url}</a></p>
      </div>

      <div style="background:#160c0c;border:1px solid rgba(192,57,43,0.3);border-radius:10px;padding:20px;margin-bottom:20px;">
        <h2 style="color:#e74c3c;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Score Summary</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="text-align:center;background:#1a0808;padding:12px;border-radius:8px;">
            <div style="color:#e74c3c;font-size:28px;font-weight:700;font-family:'Space Grotesk',sans-serif;">${scan.overall_score}</div>
            <div style="color:#aaa;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Overall /100</div>
          </div>
          <div style="background:#1a0808;padding:12px;border-radius:8px;font-size:13px;">
            <div style="color:#e0e0e0;margin:2px 0;">Findable: <strong style="color:#fff;">${formatScore(scan.findable_score, 25)}</strong></div>
            <div style="color:#e0e0e0;margin:2px 0;">Quotable: <strong style="color:#fff;">${formatScore(scan.quotable_score, 25)}</strong></div>
            <div style="color:#e0e0e0;margin:2px 0;">Understandable: <strong style="color:#fff;">${formatScore(scan.understandable_score, 25)}</strong></div>
            <div style="color:#e0e0e0;margin:2px 0;">Trustworthy: <strong style="color:#fff;">${formatScore(scan.trustworthy_score, 25)}</strong></div>
          </div>
        </div>
      </div>

      <div style="background:#160c0c;border:1px solid rgba(192,57,43,0.3);border-radius:10px;padding:20px;">
        <h2 style="color:#e74c3c;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Issues Found</h2>
        ${buildScanSummaryHtml(scan)}
      </div>
    </div>
  `

  // Confirmation email to prospect
  const prospectEmailHtml = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0c0c0c;padding:32px;max-width:600px;margin:0 auto;border-radius:12px;">
      <p style="color:#e74c3c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">REBEL MARKETER</p>
      <h1 style="color:#fff;font-size:22px;margin:0 0 20px;font-family:'Space Grotesk',sans-serif;">Thanks — I'll be in touch shortly.</h1>
      <p style="color:#e0e0e0;font-size:15px;line-height:1.6;">I've received your AI Scanner results for <strong style="color:#fff;">${domain}</strong> (score: <strong style="color:#e74c3c;">${scan.overall_score}/100</strong>) and I'll review them and come back to you within 24 hours.</p>
      <p style="color:#e0e0e0;font-size:15px;line-height:1.6;margin-top:16px;">— Dan Langrish<br><span style="color:#aaa;font-size:13px;">Technical SEO Specialist, Rebel Marketer</span></p>
    </div>
  `

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        subject: `New quote request: ${domain} — ${scan.overall_score}/100`,
        html: danEmailHtml,
        replyTo: email,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your AI Scanner results for ${domain}`,
        html: prospectEmailHtml,
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
