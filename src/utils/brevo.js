// utils/brevo.js
const BREVO_API_KEY = process.env.REACT_APP_BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendBrevoEmail = async ({ to, templateId, params = {}, senderName = "GSO Service Link" }) => {
  const payload = {
    sender: { 
      name: senderName, 
      email: "noreply.gso.servicelink@gmail.com"
    },
    to: to,
    templateId: Number(templateId),
    params,
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Brevo error:", data);
      return;
    }
    
    console.log("Email sent successfully! Message ID:", data.messageId);
  } catch (err) {
    console.error("Send failed:", err);
  }
};