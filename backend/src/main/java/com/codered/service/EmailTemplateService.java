package com.codered.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    private static final String PRIMARY   = "#C0252D";
    private static final String PRIMARY_DARK = "#9B1C22";
    private static final String BG        = "#F9FAFB";
    private static final String CARD_BG   = "#FFFFFF";
    private static final String TEXT_MAIN = "#111827";
    private static final String TEXT_SUB  = "#6B7280";
    private static final String BORDER    = "#E5E7EB";

    // ── Push Notification confirmation (sent to admin) ────────────────────────
    public String buildPushNotificationEmail(
            String message,
            String bloodType,
            String region,
            int donorsReached,
            String outreachId,
            String dateSent) {

        String bloodTypeDisplay = bloodType != null && !bloodType.isBlank() ? bloodType : "All types";
        String regionDisplay    = region    != null && !region.isBlank()    ? region    : "All regions";
        String messageHtml      = message.replace("\n", "<br>");

        return "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<title>Push Notification Sent</title></head>" +
            "<body style='margin:0;padding:0;background:" + BG + ";font-family:Inter,Segoe UI,Arial,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:" + BG + ";padding:40px 16px;'><tr><td align='center'>" +
            "<table width='560' cellpadding='0' cellspacing='0' style='max-width:560px;width:100%;'>" +

            // Header
            "<tr><td style='background:" + PRIMARY + ";border-radius:12px 12px 0 0;padding:28px 32px;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'><tr>" +
            "<td><div style='display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 10px;" +
            "font-size:13px;font-weight:700;color:#fff;letter-spacing:0.5px;'>SRC</div></td>" +
            "<td align='right' style='color:rgba(255,255,255,0.7);font-size:12px;'>Singapore Red Cross</td>" +
            "</tr></table></td></tr>" +

            // Title band
            "<tr><td style='background:" + PRIMARY_DARK + ";padding:20px 32px 24px;'>" +
            "<div style='font-size:22px;font-weight:700;color:#fff;margin:0 0 4px;'>Push Notification Sent</div>" +
            "<div style='font-size:13px;color:rgba(255,255,255,0.75);'>Campaign dispatched successfully</div>" +
            "</td></tr>" +

            // Stats row
            "<tr><td style='background:" + CARD_BG + ";padding:24px 32px 0;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'><tr>" +
            statCell(String.valueOf(donorsReached), "Donors Reached", PRIMARY) +
            statCell(bloodTypeDisplay, "Blood Type", TEXT_MAIN) +
            statCell(regionDisplay, "Region", TEXT_MAIN) +
            "</tr></table>" +
            "</td></tr>" +

            // Divider
            "<tr><td style='background:" + CARD_BG + ";padding:20px 32px 0;'>" +
            "<div style='border-top:1px solid " + BORDER + ";'></div></td></tr>" +

            // Message preview
            "<tr><td style='background:" + CARD_BG + ";padding:20px 32px;'>" +
            "<div style='font-size:11px;font-weight:600;color:" + TEXT_SUB + ";text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;'>Message Sent</div>" +
            "<div style='background:" + BG + ";border:1px solid " + BORDER + ";border-radius:8px;padding:16px;font-size:14px;color:" + TEXT_MAIN + ";line-height:1.7;'>" +
            messageHtml + "</div>" +
            "</td></tr>" +

            // Meta footer
            "<tr><td style='background:" + CARD_BG + ";padding:0 32px 24px;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'>" +
            "<tr><td style='font-size:12px;color:" + TEXT_SUB + ";'>Outreach ID</td>" +
            "<td align='right' style='font-size:12px;font-weight:600;color:" + TEXT_MAIN + ";font-family:monospace;'>" + outreachId + "</td></tr>" +
            "<tr><td style='font-size:12px;color:" + TEXT_SUB + ";padding-top:4px;'>Sent at</td>" +
            "<td align='right' style='font-size:12px;color:" + TEXT_MAIN + ";padding-top:4px;'>" + dateSent + "</td></tr>" +
            "</table></td></tr>" +

            // Footer
            emailFooter() +
            "</table></td></tr></table></body></html>";
    }

    // ── Collaboration invitation (sent to partner) ─────────────────────────────
    public String buildInvitationEmail(
            String partnerName,
            String subject,
            String message,
            String outreachId,
            String dateSent) {

        String messageHtml = message.replace("\n", "<br>");

        return "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<title>" + subject + "</title></head>" +
            "<body style='margin:0;padding:0;background:" + BG + ";font-family:Inter,Segoe UI,Arial,sans-serif;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:" + BG + ";padding:40px 16px;'><tr><td align='center'>" +
            "<table width='560' cellpadding='0' cellspacing='0' style='max-width:560px;width:100%;'>" +

            // Header
            "<tr><td style='background:" + PRIMARY + ";border-radius:12px 12px 0 0;padding:28px 32px;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'><tr>" +
            "<td><div style='display:inline-block;background:rgba(255,255,255,0.15);border-radius:8px;padding:6px 10px;" +
            "font-size:13px;font-weight:700;color:#fff;letter-spacing:0.5px;'>SRC</div></td>" +
            "<td align='right' style='color:rgba(255,255,255,0.7);font-size:12px;'>Singapore Red Cross</td>" +
            "</tr></table></td></tr>" +

            // Title band
            "<tr><td style='background:" + PRIMARY_DARK + ";padding:20px 32px 24px;'>" +
            "<div style='font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;'>Partnership Invitation</div>" +
            "<div style='font-size:13px;color:rgba(255,255,255,0.75);'>Dear " + partnerName + "</div>" +
            "</td></tr>" +

            // Body
            "<tr><td style='background:" + CARD_BG + ";padding:28px 32px 8px;'>" +
            "<div style='font-size:14px;color:" + TEXT_MAIN + ";line-height:1.8;'>" + messageHtml + "</div>" +
            "</td></tr>" +

            // CTA
            "<tr><td style='background:" + CARD_BG + ";padding:20px 32px 28px;text-align:center;'>" +
            "<a href='mailto:codered.notify@gmail.com?subject=Re: " + subject + "' " +
            "style='display:inline-block;background:" + PRIMARY + ";color:#fff;font-size:14px;font-weight:600;" +
            "text-decoration:none;padding:12px 28px;border-radius:8px;'>Reply to Singapore Red Cross</a>" +
            "</td></tr>" +

            // Divider
            "<tr><td style='background:" + CARD_BG + ";padding:0 32px;'>" +
            "<div style='border-top:1px solid " + BORDER + ";'></div></td></tr>" +

            // Meta
            "<tr><td style='background:" + CARD_BG + ";padding:16px 32px 24px;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0'>" +
            "<tr><td style='font-size:12px;color:" + TEXT_SUB + ";'>Reference</td>" +
            "<td align='right' style='font-size:12px;font-weight:600;color:" + TEXT_MAIN + ";font-family:monospace;'>" + outreachId + "</td></tr>" +
            "<tr><td style='font-size:12px;color:" + TEXT_SUB + ";padding-top:4px;'>Date</td>" +
            "<td align='right' style='font-size:12px;color:" + TEXT_MAIN + ";padding-top:4px;'>" + dateSent + "</td></tr>" +
            "</table></td></tr>" +

            // Footer
            emailFooter() +
            "</table></td></tr></table></body></html>";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String statCell(String value, String label, String valueColor) {
        return "<td width='33%' style='text-align:center;padding:0 8px 16px;'>" +
            "<div style='font-size:26px;font-weight:700;color:" + valueColor + ";line-height:1;'>" + value + "</div>" +
            "<div style='font-size:11px;color:" + TEXT_SUB + ";margin-top:4px;'>" + label + "</div>" +
            "</td>";
    }

    private String emailFooter() {
        return "<tr><td style='background:" + BG + ";border-top:1px solid " + BORDER + ";border-radius:0 0 12px 12px;" +
            "padding:20px 32px;text-align:center;'>" +
            "<div style='font-size:12px;color:" + TEXT_SUB + ";line-height:1.6;'>" +
            "Singapore Red Cross &nbsp;·&nbsp; 15 Penang Lane, Singapore 238486<br>" +
            "This email was sent from the codeRED Blood Management System." +
            "</div></td></tr>";
    }
}
