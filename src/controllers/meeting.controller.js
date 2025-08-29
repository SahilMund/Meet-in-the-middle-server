import moment from "moment";
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
      endsAt,
      participants = [],
      creatorLocation,
    } = req.body;

    if (!title || !scheduledAt) {
      return sendResponse(res, "Title and scheduled time are required");
    }
    const { lat, lng, placeName } = creatorLocation;
    const creatorId = req.user?.id;
    const creatorEmail = req.user?.email;
    const user = await User.findById(creatorId);
    const hostName = user?.name;

    if (!user) {
      return sendResponse(res, "Unauthorized", 401);
    }

    //Create meeting data
    const meeting = new Meeting({
      title,
      description,
      creator: creatorId,
      scheduledAt,
      endsAt,
    });

    // Generating meeting link
    meeting.meetingLink = `${process.env.FRONTEND_URL}/meeting/${meeting._id}`;
    await meeting.save();

    const allParticipants = await Promise.all([
      ...participants
        .filter((p) => p.email !== creatorEmail)
        .map(async (p) => {
          let userId = null;

          if (p.email) {
            const existingUser = await User.findOne({ email: p.email });
            if (existingUser) {
              userId = existingUser._id;
            }
          }

          return {
            user: userId,
            email: p.email,
            status: "pending",
            meeting: meeting._id,
          };
        }),
    ]);
    //add meeying creator in paticipants
    allParticipants.push({
      user: creatorId,
      email: creatorEmail,
      status: "accepted",
      location: { lat, lng, placeName } || {},
      meeting: meeting._id,
    });

    // creator details
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
    let { pageNo, items } = req.query;
    pageNo = parseInt(pageNo) || 1;
    items = parseInt(items) || 10;

    const myParticipations = await Participant.find({ email })
      .skip((pageNo - 1) * items)
      .limit(items)
      .populate({
        path: "meeting",
        populate: [
          { path: "creator", select: "name email" },
          {
            path: "participants",
            populate: { path: "user", select: "name email avatar status" },
          },
        ],
      });
    if (!myParticipations.length) {
      return sendResponse(res, "No Meetings found", 200, { meetings: [] });
    }

    const meetings = myParticipations.map((p) => p.meeting);
    sendResponse(res, "Meetings fetched successfully!", 200, {
      meetings,
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const getPendingMeetings = async (req, res) => {
  try {
    const email = req.user?.email;
    let { pageNo, items } = req.query;
    pageNo = parseInt(pageNo) || 1;
    items = parseInt(items) || 10;

    // Fetch participations
    const myParticipations = await Participant.find({
      email,
      status: "pending",
    })
      .skip((pageNo - 1) * items)
      .limit(items)
      .populate({
        path: "meeting",
        populate: [
          { path: "creator", select: "name email" },
          {
            path: "participants",
            populate: { path: "user", select: "name email avatar" },
          },
        ],
      });

    if (!myParticipations.length) {
      return sendResponse(res, "No Meetings found", 200, { meetings: [] });
    }

    // Map meetings into simplified objects
    const meetings = [
      ...new Map(
        myParticipations.map((p) => [p.meeting._id.toString(), p.meeting])
      ).values(),
    ].map((m) => ({
      id: m._id,
      title: m.title,
      name: m.creator?.name || "Unknown",
      description: m.description,
      people: m.participants?.length || 0,
      date: moment(m.scheduledAt).format("MMM DD"),
      time: moment(m.scheduledAt).format("h:mmA"),
    }));

    sendResponse(res, "Pending Meetings fetched successfully!", 200, {
      meetings,
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return sendResponse(res, "Meeting not found", 500);
    }

    await Meeting.findByIdAndDelete(meetingId);
    await Participant.deleteMany({ _id: { $in: meeting.participants } });

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
    const { meetingId, lat, lng, placeName } = req.body;
    const email = req.user?.email;

    const participant = await Participant.findOne({
      meeting: meetingId,
      email,
    }).populate("meeting");
    if (participant.meeting.creator === email)
      return sendResponse(res, "You are the Creator of this room", 401);

    if (!participant) {
      return sendResponse(res, "Participant not found", 404);
    }
    participant.status = "accepted";
    participant.location.lat = lat;
    participant.location.lng = lng;
    participant.location.placeName = placeName;

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

    const participant = await Participant.findOne({
      meeting: meetingId,
      email,
    }).populate("meeting");

    if (participant.meeting.creator === email)
      return sendResponse(res, "Createor Can't reject room ", 401);
    if (!participant) {
      return sendResponse(res, "Participant not found", 404);
    }
    participant.status = "rejected";
    await participant.save();
    sendResponse(res, "Participantion updated successfully!", 200, {});
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const conflicts = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { email } = req.user;

    const currentMeeting = await Meeting.findById(meetingId);
    if (!currentMeeting) {
      return sendResponse(res, "Meeting not found", 404);
    }

    const myParticipations = await Participant.find({
      email,
      status: { $ne: "rejected" },
    })
      .select("meeting status")
      .populate("meeting");

    const meetings = myParticipations.map((p) => ({
      meeting: p.meeting,
      status: p.status,
    }));

    const conflicts = meetings.filter((m) => {
      if (!m || m.meeting._id.equals(currentMeeting._id)) return false;

      return (
        m.meeting.scheduledAt < currentMeeting.endsAt &&
        currentMeeting.scheduledAt < m.meeting.endsAt
      );
    });

    if (!conflicts.length) {
      return sendResponse(res, "No conflicts found", 200, { conflicts: [] });
    }

    return sendResponse(res, "Conflicts found", 200, {
      conflicts
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const dashboardStats = async (req, res) => {
  try {
    const email = req.user?.email;
    const data = {
      upcomingmeetings: 0,
      pendingInvations: 0,
      totalMeetings: 0,
      currentWeekMeetingCount: 0,
      avgParticipants: 0,
      successRate: 0,
    };
    const myParticipations = await Participant.find({ email }).populate({
      path: "meeting",
      populate: [
        { path: "creator", select: "name email" },
        { path: "participants" },
      ],
    });
    data.totalMeetings = myParticipations.length;
    let nv = Date.now();
    const upcomingmeetings = myParticipations.filter(
      (p) => p.meeting.scheduledAt > nv
    );
    data.upcomingmeetings = upcomingmeetings.length;

    const pendingInvations = myParticipations.filter(
      (p) => p.status === "pending"
    );
    data.pendingInvations = pendingInvations.length;

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const currentWeekMeetingCount = myParticipations.filter(
      (p) =>
        p.meeting.scheduledAt >= startOfWeek &&
        p.meeting.scheduledAt <= endOfWeek
    );
    data.currentWeekMeetingCount = currentWeekMeetingCount.length;

    if (myParticipations.length > 0) {
      const totalPartcipants = myParticipations.reduce((sum, p) => {
        return sum + p.meeting?.participants?.length || 0;
      }, 0);
      data.avgParticipants = totalPartcipants / myParticipations.length;

      const accepted = myParticipations.filter((p) => p.status === "accepted");
      data.successRate = (accepted.length / myParticipations.length).toFixed(2);
    }
    return sendResponse(res, "succesfully fetch the stats", 200, data);
  } catch (error) {
    return sendResponse(res, { message: error.message }, 500, null);
  }
};

export const upcomingMeetings = async (req, res) => {
  try {
    const email = req.user?.email;
    let { pageNo, items } = req.query;
    pageNo = parseInt(pageNo) || 1;
    items = parseInt(items) || 10;

    const myParticipations = await Participant.find({ email })
      .skip((pageNo - 1) * items)
      .limit(items)
      .populate({
        path: "meeting",
        match: { scheduledAt: { $gte: new Date() } },
        populate: [
          { path: "creator", select: "name email" },
          { path: "participants" },
        ],
      });
    const upcomingParticipations = myParticipations.filter(
      (p) => p.meeting !== null
    );
    if (!myParticipations.length) {
      return sendResponse(res, "No Meetings found", 200, { meetings: [] });
    }

    const meetings = upcomingParticipations.map((p) => p.meeting);

    sendResponse(res, "Meetings fetched successfully!", 200, { meetings });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
export const recentActivity = async (req, res) => {
  const { id: userId } = req.user;
  try {
    let { limit } = req.query;
    limit = limit || 5;
    if (!userId) {
      return res.sendResponse(res, "userId is required", 400, null);
    }
    const recentMeetings = await Meeting.find({ creator: userId })
      .populate("creator", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    const meetingActivities = recentMeetings.map((meeting) => ({
      type: "meetingCreated",
      user: meeting.creator,
      target: { meetingId: meeting._id, title: meeting.title },
      timestamp: meeting.createdAt,
    }));

    const recentPartcipants = await Participant.find({ user: userId })
      .populate("user", "name email")
      .populate("meeting", "title")
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    const participantActivities = recentPartcipants.map((p) => ({
      type: "participantAction",
      user: p.user,
      target: {
        meetingId: p.meeting._id,
        meetingTitle: p.meeting.title,
        status: p.status,
      },
      timestamp: p.updatedAt,
    }));

    const allActivities = [...meetingActivities, ...participantActivities];
    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    return sendResponse(res, "success", 200, allActivities);
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
