import { google } from "googleapis";

import User from "../models/user.model.js";

/**
 * Create Google Calendar Event
 * @param {Object} params - event details
 * @param {String} params.userId - Creator's userId
 * @param {String} params.title - Meeting title
 * @param {String} params.description - Meeting description
 * @param {String|Date} params.scheduledAt - Start time
 * @param {String|Date} params.endsAt - End time
 * @param {String} params.creatorEmail - Host email
 * @param {Array} params.participants - Array of { email }
 */
export const createGoogleCalendarEvent = async ({
  userId,
  title,
  description,
  scheduledAt,
  endsAt,
  creatorEmail,
  participants = [],
}) => {
  try {
    // 1. Fetch user from DB
    const user = await User.findById(userId);

    if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
      console.log("⚠️ Skipping Google Calendar integration: no tokens found");
      return null;
    }

    // 2. Setup OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oAuth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // 3. Define event
    const event = {
      summary: title,
      description: description || "Meeting scheduled via MeetInMiddle App",
      start: {
        dateTime: new Date(scheduledAt).toISOString(),
        timeZone: "Asia/Kolkata", // TODO: make dynamic per user
      },
      end: {
        dateTime: new Date(endsAt || scheduledAt).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [
        { email: creatorEmail },
        ...participants.map((p) => ({ email: p.email })),
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 10 }, // 10 minutes before
        ],
      },
    };

    // 4. Insert event into calendar
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all", // notify participants
    });

    console.log("✅ Google Calendar event created:", response.data.htmlLink);

    return response.data;
  } catch (error) {
    console.error("❌ Google Calendar event creation failed:", error.message);
    return null;
  }
};
