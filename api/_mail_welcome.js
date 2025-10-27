const SITE = "https://briko.app";
const LOGO  = `${SITE}/email/briko-logo.png`;
const BANNER = `${SITE}/email/briko-banner.png`;

// Brand
const PINK = "#FF0062";
const YELLOW = "#FFD808";
const INK = "#2F3061";
const DARK = "#343434";

// Plaintext
function buildText() {
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

// HTML (600px table, inline styles)
function buildHtml() {
  return `
  <!doctype html>
  <html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta charset="UTF-8" />
    <title>Welcome to Briko</title>
    <style>
      @media only screen and (max-width:620px){
        .container{ width:100% !important; }
        .px{ padding-left:20px!important;padding-right:20px!important; }
      }
      a{ color:${PINK}; text-decoration:none; }
    </style>
  </head>
  <body style="margin:0;background:${YELLOW};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${YELLOW};">
      <tr><td align="center" style="padding:24px 0;">
        <table role="presentation" width="600" class="container" cellspacing="0" cellpadding="0" border="0"
               style="width:600px;max-width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#fff">
              <img src="${BANNER}" width="600" alt="Briko" style="display:block;border:0;outline:0;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:18px 40px;color:${INK};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
              <h1 style="margin:6px 0 10px 0;font-size:24px;line-height:1.25;color:${INK};">
                You’re in — welcome to Briko <span style="color:${PINK}">♥</span>
              </h1>
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;">
                Thanks for hopping on the list. We’ll drop you a note when new builds, color palettes,
                or creator tools go live.
              </p>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:${DARK};">
                No spam, no filler — just LEGO-style art, tech, and the weird little magic in between.
              </p>
              <a href="${SITE}" style="display:inline-block;background:${PINK};color:#fff;font-weight:600;border-radius:10px;padding:10px 16px;font-size:14px;">
                Visit Briko
              </a>
              <p style="margin:22px 0 0 0;font-size:14px;color:${DARK};">– Phil<br/>briko.app</p>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:16px 40px 28px 40px;color:${DARK};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;">
              You received this because you subscribed at <a href="${SITE}">briko.app</a>.
              <br/>Unsubscribe: reply with “unsubscribe”.
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>
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
    text: buildText(),
    html: buildHtml(),
    headers: { "List-Unsubscribe": `<mailto:${replyTo}?subject=unsubscribe>` }
  });
}

async function sendAdminNotify(transporter, subscriberEmail, ip) {
  const from = process.env.SUBSCRIBE_FROM || "Briko <phil@briko.app>";
  const to = process.env.SUBSCRIBE_NOTIFY_TO || "phil@briko.app";
  await transporter.sendMail({
    from, to, subject: "New Briko subscriber",
    text: `Email: ${subscriberEmail}\nWhen: ${new Date().toISOString()}\nIP: ${ip || "n/a"}` 
  });
}

module.exports = { sendWelcome, sendAdminNotify };
