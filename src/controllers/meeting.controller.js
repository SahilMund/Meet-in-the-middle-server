import sendCancellationEmailHtml from "../emailTemplates/meetingCancellation.js";
import sendInvitationEmailHtml from "../emailTemplates/meetingInvitation.js";
import Meeting from "../models/meeting.model.js";
import Participant from "../models/participant.model.js";
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";
import { sendMeetingInvitationMail } from "../utils/sendMail.util.js";

// conflict controller is pending

export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledAt,
      participants = [],
      creatorLocation,
    } = req.body;

    if (!title || !scheduledAt) {
      return sendResponse(res, "Title and scheduled time are required");
    }

    const creatorId = req.user?._id;
    const creatorEmail = req.user?.email;

    const user = await User.findById(creatorId);
    const hostName = user?.name;

    if (!creatorId) {
      return sendResponse(res, "Unauthorized", 401);
    }

    //Create meeting data
    const meeting = new Meeting({
      title,
      description,
      creator: creatorId,
      scheduledAt,
    });

    // Generating meeting link
    meeting.meetingLink = `${process.env.FRONTEND_URL}/meeting/${meeting._id}`;
    await meeting.save();

    const allParticipants = await Promise.all([
      ...participants.map(async (p) => {
        let userId = p.userId || null;

        if (!userId && p.email) {
          const existingUser = await User.findOne({ email: p.email });
          if (existingUser) {
            userId = existingUser._id;
          }
        }

        return {
          user: userId || null,
          email: p.email,
          status: "pending",
          meeting: meeting._id,
        };
      }),

      // creator details
      {
        user: creatorId,
        email: creatorEmail,
        status: "accepted",
        location: creatorLocation || {},
        meeting: meeting._id,
      },
    ]);

    const createdParticipants = await Participant.insertMany(allParticipants);

    meeting.participants = createdParticipants.map((p) => p._id);
    const updatedMeeting = await meeting.save();

    const html = sendInvitationEmailHtml({
      title,
      description,
      hostName,
      scheduledAt: new Date(scheduledAt).toLocaleString(),
      meetingLink: meeting.meetingLink,
    });

    sendMeetingInvitationMail({
      to: creatorEmail,
      cc: participants,
      subject: `Meeting Invitation from ${hostName}`,
      html,
    })
      .then()
      .catch((error) => {
        console.error("Error sending meeting invitation:", error);
      });

    return sendResponse(res, "Meeting created successfully", 201, {
      meeting: updatedMeeting,
    });
  } catch (error) {
    return sendResponse(res, error.message, 500);
  }
};

export const getMeetings = async (req, res) => {
  try {
    const email = req.user?.email;
    let { pageNo, items } = req.body;
    pageNo = parseInt(pageNo) || 1;
    items = parseInt(items) || 10;

    const participations = await Participant.find({ email })
      .skip((pageNo - 1) * items)
      .limit(items)
      .populate({
        path: "meeting",
        populate: [
          { path: "creator", select: "name email" },
          { path: "participants" },
        ],
      });

    if (!participations.length) {
      return sendResponse(res, "No Meetings found", 200, { meetings: [] });
    }

    const meetings = participations.map((p) => p.meeting);

    sendResponse(res, "Meetings fetched successfully!", 200, { meetings });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId).populate("participants");

    if (!meeting) {
      return sendResponse(res, "Meeting not found", 500);
    }

    await Meeting.findByIdAndDelete(meetingId).populate("participants");
    await Participant.deleteMany({ meeting: { $in: meeting.participants } });

    const html = sendCancellationEmailHtml({
      title: meeting.title,
      description: meeting.description,
      hostName: meeting.creator,
      scheduledAt: new Date(meeting.scheduledAt).toLocaleString(),
    });
    sendMeetingInvitationMail({
      to: req.user?.email,
      cc: meeting.participants,
      subject: `Meeting Cancellation from ${meeting.creator}`,
      html,
    })
      .then()
      .catch((error) => {
        console.error("Error sending meeting invitation:", error);
      });

    sendResponse(res, "Meetings deleted successfully!", 200, { meeting });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId).populate("participants");

    if (!meeting) {
      return sendResponse(res, "Meeting not found", 404);
    }

    sendResponse(res, "Meeting fetched successfully!", 200, { meeting });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const editMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, description } = req.body;

    const meeting = await Meeting.findById(meetingId);
    // .populate("participants");

    if (!meeting) {
      return sendResponse(res, "No meeting found", 404);
    }
    meeting.title = title;
    meeting.description = description;
    const updatedMeeting = await meeting.save();

    const html = sendInvitationEmailHtml({
      title,
      description,
      hostName: meeting.creator,
      scheduledAt: new Date(meeting.scheduledAt).toLocaleString(),
      meetingLink: meeting.meetingLink,
    });

    sendMeetingInvitationMail({
      to: "",
      ccc: meeting.participants,
      subject: `Meeting Invitation from ${meeting.creator}`,
      html,
    })
      .then()
      .catch((error) => {
        console.error("Error sending meeting invitation:", error);
      });

    sendResponse(res, "Meeting updated successfully!", 200, {
      meeting: updatedMeeting,
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const acceptMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const email = req.user?.email;

    const participant = await Participant.find({ meeting: meetingId });

    if (!participant || participant.email !== email) {
      return sendResponse(res, "Participant not found", 404);
    }
    participant.status = "accepted";
    await participant.save();
    sendResponse(res, "Participantion updated successfully!", 200, {});
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const rejectMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const email = req.user?.email;

    const participant = await Participant.find({ meeting: meetingId });

    if (!participant || participant.email !== email) {
      return sendResponse(res, "Participant not found", 404);
    }
    participant.status = "rejected";
    await participant.save();
    sendResponse(res, "Participantion updated successfully!", 200, {});
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
