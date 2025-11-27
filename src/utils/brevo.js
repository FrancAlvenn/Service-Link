// utils/brevo.js
const BREVO_API_KEY = process.env.REACT_APP_BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendBrevoEmail = async ({
  to,
  templateId,
  params = {},
  senderName = "GSO Service Link",
  cc = [],           // Now supports CC
  bcc = [],          // Optional: for BCC
}) => {
  const payload = {
    sender: {
      name: senderName,
      email: "noreply.gso.servicelink@gmail.com",
    },
    to: Array.isArray(to) ? to : [to], // Ensure to is always an array
    cc: [
      ...cc,
      { email: "servicelink.dyci@gmail.com", name: "ServiceLink DYCI" } // Always CC this address
    ].filter(Boolean), // Remove empty entries
    bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
    templateId: Number(templateId),
    params,
  };

  // Clean up empty arrays (Brevo ignores them, but cleaner)
  if (payload.cc.length === 0) delete payload.cc;
  if (payload.bcc.length === 0) delete payload.bcc;

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", data);
      throw new Error(`Brevo error: ${data.message || "Unknown error"}`);
    }

    console.log("Email sent successfully!", {
      messageId: data.messageId,
      to: payload.to.map(u => u.email),
      cc: payload.cc?.map(u => u.email) || [],
    });

    return data;
  } catch (err) {
    console.error("Failed to send email via Brevo:", err);
    throw err;
  }
};