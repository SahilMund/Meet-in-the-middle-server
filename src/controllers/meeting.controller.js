import moment from "moment";
import schedule from "node-schedule";
import sendCancellationEmailHtml from "../emailTemplates/meetingCancellation.js";
import sendInvitationEmailHtml from "../emailTemplates/meetingInvitation.js";
import Meeting from "../models/meeting.model.js";
import Participant from "../models/participant.model.js";
import User from "../models/user.model.js";
import testData from "./testdata.js"
import sendResponse from "../utils/response.util.js";
import {
  scheduleConfirmationRemainder,
  sendEmail,
  sendMeetingInvitationMail,
} from "../utils/sendMail.util.js";
import { createGoogleCalendarEvent } from "../services/google-calendar.service.js";
import { sendPushToSubscribers } from "../controllers/notifications.controller.js";
import { createAndSendNotification } from "../services/notify.service.js";

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

    const { lat, lng, placeName } = creatorLocation || {};
    const creatorId = req.user?.id;
    const creatorEmail = req.user?.email;

    const user = await User.findById(creatorId);
    if (!user) {
      return sendResponse(res, "Unauthorized", 401);
    }

    const hostName = user?.name;

    // 1. Create meeting document
    const meeting = new Meeting({
      title,
      description,
      creator: creatorId,
      scheduledAt,
      endsAt,
    });

    // 2. Generate meeting link
    meeting.meetingLink = `${process.env.FRONTEND_URL}/meeting/${meeting._id}`;
    await meeting.save();

    // 3. Prepare participants
    const allParticipants = await Promise.all(
      participants
        .filter((p) => p.email !== creatorEmail)
        .map(async (p) => {
          let userId = null;
          if (p.email) {
            const existingUser = await User.findOne({ email: p.email });
            if (existingUser) userId = existingUser._id;
          }

          return {
            user: userId,
            name: p.name,
            email: p.email,
            status: "Pending",
            meeting: meeting._id,
          };
        })
    );

    // Add creator as participant
    allParticipants.push({
      user: creatorId,
      name: user.name,
      email: creatorEmail,
      status: "Accepted",
      location: { lat, lng, placeName } || {},
      meeting: meeting._id,
    });

    // const createdParticipants = await Participant.insertMany(allParticipants);
    // meeting.participants = createdParticipants.map((p) => p._id);
    // const updatedMeeting = await meeting.save();

    const createdParticipants = await Participant.insertMany(allParticipants, {
      ordered: false,
    });

    //avoids multiple round-trips, if we ignore save()
    await Meeting.updateOne(
      { _id: meeting._id },
      {
        $push: {
          participants: { $each: createdParticipants.map((p) => p._id) },
        },
      }
    );  


    // 4. Send email invitations
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
    }).catch((error) => {
      console.error("Error sending meeting invitation:", error);
    });

    // 5. Google Calendar integration (only if user has Google tokens)
    createGoogleCalendarEvent({
      userId: creatorId,
      title,
      description,
      scheduledAt,
      endsAt,
      creatorEmail,
      participants,
    });

    // ✅ 6. Push notification to participants
    const payload = {
      title: "New Meeting Scheduled",
      body: `Meeting "${title}" created by ${hostName}`,
      url: meeting.meetingLink,
    };

    // Send push to all participant emails
    const participantEmails = allParticipants.map((p) => p.email);
    sendPushToSubscribers(payload, participantEmails);

    return sendResponse(res, "Meeting created successfully", 201, {
      meeting: payload,
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

    sendResponse(res, "Meetings fetched successfully!", 200, {
      meetings: myParticipations,
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
      status: "Pending",
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

    const meetings = [
      ...new Map(
        myParticipations
          .filter((p) => p.meeting)
          .map((p) => [p.meeting._id.toString(), p.meeting])
      ).values(),
    ].map((m) => ({
      id: m._id,
      title: m.title,
      name: m.creator?.name || "Unknown",
      description: m.description,
      people: m.participants?.length || 0,
      date: m.scheduledAt ? moment(m.scheduledAt).format("MMM DD") : "",
      time: m.scheduledAt ? moment(m.scheduledAt).format("h:mmA") : "",
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

    // 🔔 Notify all participants
    for (const p of meeting.participants) {
      await createAndSendNotification(
        p,
        "MEETING_DELETED",
        `Meeting "${meeting.title}" was cancelled by ${meeting.creator}`,
        { meetingId }
      );
    }

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

    const meeting = await Meeting.findById(meetingId)
      .populate("creator")
      .populate("participants");

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

    // sendMeetingInvitationMail({
    //   to: "",
    //   ccc: meeting.participants,
    //   subject: `Meeting Invitation from ${meeting.creator}`,
    //   html,
    // })
    //   .then()
    //   .catch((error) => {
    //     console.error("Error sending meeting invitation:", error);
    //   });

    sendResponse(res, "Meeting updated successfully!", 200, {
      meeting: updatedMeeting,
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

// This can be moved to invitations
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
    participant.status = "Accepted";
    participant.location.lat = lat;
    participant.location.lng = lng;
    participant.location.placeName = placeName;

    await participant.save();

    // 🔔 Notify creator
    if (participant.meeting.creator) {
      await createAndSendNotification(
        participant.meeting.creator,
        "MEETING_ACCEPTED",
        `${participant.name} accepted your meeting "${participant.meeting.title}"`,
        { meetingId: meetingId }
      );
    }

    sendResponse(res, "Participantion updated successfully!", 200, {});
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

// This can be moved to invitations
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
    participant.status = "Rejected";
    await participant.save();

    // 🔔 Notify creator
    if (participant.meeting.creator) {
      await createAndSendNotification(
        participant.meeting.creator,
        "MEETING_REJECTED",
        `${participant.name} rejected your meeting "${participant.meeting.title}"`,
        { meetingId }
      );
    }

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
      status: { $ne: "Rejected" },
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

    return sendResponse(res, "Conflicts found", 200, { conflicts });
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
      (p) => p.status === "Pending"
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

      const accepted = myParticipations.filter((p) => p.status === "Accepted");
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

export const scheduleMeetingReminder = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const meeting = await Meeting.findById(meetingId)
      .select("title creator participants scheduledAt meetingLink")
      .populate({
        path: "participants",
        select: "name email status user",
        populate: {
          path: "user",
          select: "settings",
          populate: {
            path: "settings",
            select: "meetingsReminders",
          },
        },
      })
      .populate("creator", "name email")
      .lean();
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
    const startTime = new Date(meeting.scheduledAt);

    //filter participants
    const participants = meeting.participants.filter(
      (p) =>
        p.status === "Accepted" && p.user?.settings?.meetingsReminders === true
    );
    const recipientEmails = participants.map((p) => p.user.email);
    const remainder1Day = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
    const remainder3Hours = new Date(startTime.getTime() - 3 * 60 * 60 * 1000);
    schedule.scheduleJob(remainder1Day, async () => {
      await sendEmail(
        recipientEmails,
        `Reminder: Meeting "${meeting.title}" is tomorrow`,
        `Hello, you have a meeting "${meeting.title}" scheduled by ${meeting.creator.name} tomorrow.The meeting Link ${meeting.meetingLink}`
      );
    });

    schedule.scheduleJob(remainder3Hours, async () => {
      await sendEmail(
        recipientEmails,
        `Reminder: Meeting "${meeting.title}" starts in 3 hours`,
        `Hello, your meeting "${meeting.title}" scheduled by ${meeting.creator.name} will start in 3 hours.The meeting Link ${meeting.meetingLink}`
      );
    });
    return sendResponse(res, "remainders scheduled successfully", 200, {
      totalPartcipants: participants.length,
    });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const confirmationRemainder = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const meeting = await Meeting.findById(meetingId)
      .select("title creator participants scheduledAt meetingLink")
      .populate({
        path: "participants",
        select: "name email status user",
        populate: {
          path: "user",
          select: "settings",
          populate: {
            path: "settings",
            select: "meetingsReminders",
          },
        },
      })
      .populate("creator", "name email")
      .lean();
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
    const startTime = new Date(meeting.scheduledAt);

    //filter participants
    const participants = meeting.participants.filter(
      (p) =>
        p.status === "Pending" && p.user?.settings?.meetingsReminders === true
    );
    await scheduleConfirmationRemainder(meeting, participants, startTime);
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
export const calculateEquidistantPoint = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId).populate(
      "participants",
      "location status"
    );
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
    const acceptedParticipants = meeting.participants.filter(
      (p) => p.status === "Accepted" && p.location?.lat && p.location?.lng
    );
    if (acceptedParticipants.length < 2) {
      return sendResponse(res, "No accepted participants with location", 400);
    }
    const totalLat = acceptedParticipants.reduce(
      (sum, p) => sum + p.location.lat,
      0
    );
    const totalLng = acceptedParticipants.reduce(
      (sum, p) => sum + p.location.lng,
      0
    );
    const equidistantPoint = {
      lat: totalLat / acceptedParticipants.length,
      lng: totalLng / acceptedParticipants.length,
    };
    return sendResponse(res, "success", 200, { equidistantPoint });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const acceptedParticipantsLocations = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId).populate(
      "participants",
      "location status name email"
    );
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
    const locations = meeting.participants
      .filter(
        (p) => p.status === "Accepted" && p.location?.lat && p.location?.lng
      )
      .map((p) => ({
        name: p.name,
        email: p.email,
        lat: p.location.lat,
        lng: p.location.lng,
        placeName: p.location.placeName || "Unknown",
      }));
    return sendResponse(res, "success", 200, { locations });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const nearByPlaces = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { type } = req.query;
    const meeting = await Meeting.findById(meetingId).populate(
      "participants",
      "location status"
    );
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
    const acceptedParticipants = meeting.participants.filter(
      (p) => p.status === "Accepted" && p.location?.lat && p.location?.lng
    );
    if (acceptedParticipants.length < 2) {
      return sendResponse(res, "No accepted participants with location", 400);
    }
    const totalLat = acceptedParticipants.reduce(
      (sum, p) => sum + p.location.lat,
      0
    );
    const totalLng = acceptedParticipants.reduce(
      (sum, p) => sum + p.location.lng,
      0
    );
    const equidistantPoint = {
      lat: totalLat / acceptedParticipants.length,
      lng: totalLng / acceptedParticipants.length,
    };
    //save equidistant point in meeting schema
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return sendResponse(
        res,
        "Google Places API key not configured",
        500,
        null
      );
    } 
    const radius = 5000; // 5 km radius
    const placeType = type.filter(Boolean).join('|') ;
    const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${equidistantPoint.lat},${equidistantPoint.lng}&radius=${radius}&keyword=${placeType}&key=${apiKey}`;
    // const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${equidistantPoint.lat},${equidistantPoint.lng}&radius=${radius}&type=${placeType}&key=${apiKey}`;
    //`https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="${placeType}"](around:${radius},${equidistantPoint.lat},${equidistantPoint.lng});out;`;
    // const response = await fetch(googlePlacesUrl);
    // const data = await response.json();
    const data = testData;

    if (data.status !== "OK") {
      return sendResponse(res, "Error fetching nearby placess", 500, null);
    }
    const places = data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
      placeId: place.place_id,
      rating: place.rating,
      photos:place.photos,
      userRatingsTotal: place.user_ratings_total,
    }));
    //save places in meeting schema
    return sendResponse(res, "success", 200, { places });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const suggestedPlaces = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId)
      .populate("suggestedLocations") // ✅ correct populate
      .select("suggestedLocations");  // ✅ correct field
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }
     const suggestedPlaces =meeting.suggestedLocations;
    return sendResponse(res, "success", 200, { suggestedPlaces });
  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};

export const finalizedLocation = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await Meeting.findById(meetingId)
      .populate("suggestedLocations") // ✅ correct populate
      .select("suggestedLocations");  // ✅ correct field
    if (!meeting) {
      return sendResponse(res, "meeting not found", 400, null);
    }

     const suggestedPlaces =meeting.suggestedLocations;
if(suggestedPlaces.length===0) return sendResponse(res, "No Suggested Places", 202);
     const highestVotedPlace = suggestedPlaces.reduce((acc,ele)=>{
      return acc.voteCount>=ele.voteCount?acc:ele;
     })
  const suggestedLocationIsUpdated=    await SuggestedLocation.findByIdAndUpdate(highestVotedPlace._id,{isFinalized:true},{new:true})
    return sendResponse(res, "success", 200, { suggestedLocationIsUpdated });

  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};
export const toggleLike = async (req, res) => {
  try {
    const { suggestedPlacesId } = req.params;
    const currentLocation = await SuggestedLocation.findById(suggestedPlacesId)
    
    if (!currentLocation) {
      return sendResponse(res, "Suggested Location not found", 400, null);
    }
    if(currentLocation.voters.includes(req.user.id)) {
      await SuggestedLocation.findByIdAndUpdate(
  suggestedPlacesId,
  {
    $pull: { voters: req.user.id },  // remove user from voters array
    $inc: { voteCount: -1 },         // decrement voteCount by 1
  },
  { new: true } // optional: returns updated doc
);

    }
     else {
    await SuggestedLocation.findByIdAndUpdate(suggestedPlacesId,{$push:{voters:req.user.id}, $inc: { voteCount:1 }, })
     }
    return sendResponse(res, "Like Updated Successfully", 200 );

  } catch (error) {
    sendResponse(res, error.message, 500);
  }
};