// src/utils/emailTemplates.js
export const renderDetailsTable = (details = []) => {
  if (!Array.isArray(details) || details.length === 0) {
    return "<p style='color:#64748b; font-style:italic;'>No items requested.</p>";
  }

  const rows = details
    .map(item => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;"><strong>x${item.quantity || 1}</strong></td>
        <td style="padding:12px 16px;">${(item.particulars || item.name || "—").replace(/^\*\s*/, "")}</td>
        <td style="padding:12px 16px;">${item.description || item.remarks || "—"}</td>
      </tr>
    `)
    .join("");

  return `
    <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:14px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:12px 16px; text-align:left; color:#475569; font-weight:600;">Qty</th>
          <th style="padding:12px 16px; text-align:left; color:#475569; font-weight:600;">Item</th>
          <th style="padding:12px 16px; text-align:left; color:#475569; font-weight:600;">Description / Remarks</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};