package com.codered.service;

import com.codered.model.Alert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SesNotificationService {

    private final SesV2Client sesV2Client;

    @Value("${aws.ses.from-email}")
    private String fromEmail;

    @Value("${aws.ses.test-recipient}")
    private String testRecipient;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, h:mm a");

    public void publishAlert(Alert alert) {
        List<String> recipients = List.of(testRecipient);
        if (recipients == null || recipients.isEmpty()) {
            log.warn("No recipients configured — skipping email for alert: {}", alert.getTitle());
            return;
        }

        String hospital = alert.getHospital() != null ? alert.getHospital().getName() : "All Hospitals";
        String location = alert.getLocation() != null ? alert.getLocation() : "N/A";
        String time = alert.getCreatedAt() != null ? alert.getCreatedAt().format(FORMATTER) : "N/A";
        String priority = alert.getPriority().name();
        String priorityColor = switch (priority) {
            case "CRITICAL" -> "#dc2626";
            case "HIGH"     -> "#ea580c";
            default         -> "#d97706";
        };

        String html = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

                        <tr>
                          <td style="background:#b91c1c;padding:24px 32px;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">codeRED</h1>
                            <p style="margin:4px 0 0;color:#fca5a5;font-size:13px;">Blood Management System Alert</p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:24px 32px 0;">
                            <span style="background:%s;color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px;letter-spacing:1px;">%s</span>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:12px 32px 0;">
                            <h2 style="margin:0;color:#111827;font-size:20px;font-weight:700;">%s</h2>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:12px 32px 24px;">
                            <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">%s</p>
                          </td>
                        </tr>

                        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

                        <tr>
                          <td style="padding:20px 32px;">
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color:#6b7280;font-size:13px;padding:5px 24px 5px 0;white-space:nowrap;">Hospital</td>
                                <td style="color:#111827;font-size:13px;font-weight:600;padding:5px 0;">%s</td>
                              </tr>
                              <tr>
                                <td style="color:#6b7280;font-size:13px;padding:5px 24px 5px 0;">Location</td>
                                <td style="color:#111827;font-size:13px;font-weight:600;padding:5px 0;">%s</td>
                              </tr>
                              <tr>
                                <td style="color:#6b7280;font-size:13px;padding:5px 24px 5px 0;">Time</td>
                                <td style="color:#111827;font-size:13px;font-weight:600;padding:5px 0;">%s</td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding:8px 32px 32px;">
                            <a href="http://localhost:5173" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">Log in to codeRED</a>
                          </td>
                        </tr>

                        <tr>
                          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated alert from codeRED. Do not reply to this email.</p>
                          </td>
                        </tr>

                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(priorityColor, priority, alert.getTitle(), alert.getMessage(), hospital, location, time);

        String plainText = String.format("[%s] %s\n\n%s\n\nHospital: %s\nLocation: %s\nTime: %s",
                priority, alert.getTitle(), alert.getMessage(), hospital, location, time);

        String subject = "[codeRED] " + priority + " — " + alert.getTitle();

        SendEmailRequest request = SendEmailRequest.builder()
                .fromEmailAddress(fromEmail)
                .destination(Destination.builder().toAddresses(recipients).build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(Content.builder().data(subject).charset("UTF-8").build())
                                .body(Body.builder()
                                        .html(Content.builder().data(html).charset("UTF-8").build())
                                        .text(Content.builder().data(plainText).charset("UTF-8").build())
                                        .build())
                                .build())
                        .build())
                .build();

        sesV2Client.sendEmail(request);
        log.info("SES email sent for alert '{}' to {} recipient(s)", alert.getTitle(), recipients.size());
    }
}
