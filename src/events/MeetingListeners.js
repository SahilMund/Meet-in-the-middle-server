import {
  sendMeetingInvitationMail,
} from "../utils/sendMail.util.js";
import sendInvitationEmailHtml from "../emailTemplates/meetingInvitation.js";

import { createGoogleCalendarEvent } from "../services/google-calendar.service.js";
import { sendPushToSubscribers } from "../controllers/notifications.controller.js";

// Register listeners
export default function registerMeetingListeners(eventBus) {
  eventBus.on("meetingCreated", async ({ meeting, participants, creator, hostName }) => {
    try {
      // 1. Send email invitations
      console.log("[meetingCreated] - event triggered");

      const html = sendInvitationEmailHtml({
        title: meeting.title,
        description: meeting.description,
        hostName,
        scheduledAt: new Date(meeting.scheduledAt).toLocaleString(),
        meetingLink: meeting.meetingLink,
      });

      sendMeetingInvitationMail({
        to: creator.email,
        cc: participants,
        subject: `Meeting Invitation from ${hostName}`,
        html,
      }).catch((err) => console.error("Error sending email:", err));

      // 2. Google Calendar
      createGoogleCalendarEvent({
        userId: creator.id,
        title: meeting.title,
        description: meeting.description,
        scheduledAt: meeting.scheduledAt,
        endsAt: meeting.endsAt,
        creatorEmail: creator.email,
        participants,
      });

      // 3. Push notification
      const payload = {
        title: "New Meeting Scheduled",
        body: `Meeting "${meeting.title}" created by ${hostName}`,
        url: meeting.meetingLink,
      };
      const participantEmails = participants.map((p) => p.email);
      sendPushToSubscribers(payload, participantEmails);

      console.error("MeetingCreated listener succeeded:");

    } catch (error) {
      console.error("MeetingCreated listener failed:", error);
    }
  });
}
