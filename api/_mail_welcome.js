// api/_mail_welcome.js
const SITE = "https://briko.app";
const LOGO = `${SITE}/email/briko-logo.png`;        // or .../email/briko-banner.png

// Plaintext fallback
function buildText(email) {
  return [
    "Hey there!",
    "",
    "You’re officially on the Briko list — thanks for hopping in.",
    "We’ll send the occasional update when new builds, color palettes, or creator tools drop.",
    "No spam, no filler — just LEGO-style art, tech, and the weird little magic in between.",
    "",
    "If you ever want out, just reply \"unsubscribe\".",
    "",
    "– Phil",
    "briko.app",
  ].join("\n");
}

// Simple, bulletproof 600px table layout with inline styles
function buildHtml(email) {
  const pink = "#ff2b6a";
  const yellow = "#ffd84d";
  const ink = "#2a2343";
  const gray = "#6b6b6b";

  return `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome to Briko</title>
    <style>
      /* mobile */
      @media only screen and (max-width:620px){
        .container{ width:100% !important; }
        .px{ padding-left:20px!important;padding-right:20px!important; }
      }
      a{ color:${pink}; text-decoration:none; }
    </style>
  </head>
  <body style="margin:0;background:${yellow};">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background:${yellow};">
      <tr>
        <td align="center" style="padding:24px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">
            <!-- Header / Banner -->
            <tr>
              <td style="background:#ffffff;">
                <div style="text-align:center;padding:24px 0 8px 0;">
                  <img src="${LOGO}" alt="Briko" width="160" height="auto" style="display:inline-block;border:0;outline:0;text-decoration:none;">
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="px" style="padding:8px 40px 8px 40px;color:${ink};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                <h1 style="margin:6px 0 12px 0;font-size:24px;line-height:1.25;color:${ink};">You’re in — welcome to Briko 💖</h1>
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;">
                  Thanks for hopping on the list. We’ll drop you a note when new builds, color palettes, or creator tools go live.
                </p>
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;">
                  No spam, no filler — just LEGO-style art, tech, and the weird little magic in between.
                </p>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;">
                  If you ever want out, just reply <em>“unsubscribe”</em>.
                </p>

                <a href="${SITE}" style="display:inline-block;background:${pink};color:#fff;font-weight:600;border-radius:10px;padding:10px 16px;font-size:14px;">
                  Visit Briko
                </a>

                <p style="margin:22px 0 0 0;font-size:14px;color:${gray};">– Phil<br/>briko.app</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="px" style="padding:16px 40px 28px 40px;color:${gray};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;">
                <div>
                  You received this because you subscribed at <a href="${SITE}">briko.app</a>.
                  <br/>Unsubscribe: reply with “unsubscribe”.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

async function sendWelcome(transporter, toEmail) {
  const from = process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>";
  const replyTo = "phil@briko.app";

  await transporter.sendMail({
    from,
    to: toEmail,
    replyTo,
    subject: "You’re on the Briko list 💖",
    text: buildText(toEmail),
    html: buildHtml(toEmail),
    headers: {
      "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>` 
    }
  });
}

async function sendAdminNotify(transporter, subscriberEmail, ip) {
  const to = process.env.SUBSCRIBE_NOTIFY_TO || "phil@briko.app";
  const from = process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>";
  await transporter.sendMail({
    from,
    to,
    subject: "New Briko subscriber",
    text: `Email: ${subscriberEmail}\nWhen: ${new Date().toISOString()}\nIP: ${ip || "n/a"}` 
  });
}

module.exports = { sendWelcome, sendAdminNotify };
