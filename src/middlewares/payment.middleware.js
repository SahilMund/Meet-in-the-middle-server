import { PLANS } from "../configs/plan.js";
import Meeting from "../models/meeting.model.js";
import Subscription from "../models/subscription.model.js";

export const enforcePlanLimits = async (req, res, next) => {
  try {
    const user = req.user;

    console.log(req.user)

    const subscription = await Subscription.findOne({ user: req.user.id }).select(
          "plan currentPeriodEnd status"
        )

    console.log('subscription', subscription)
    
    // Auto-downgrade if subscription expired
    if (
      subscription?.plan === "premium" &&
      (!subscription?.currentPeriodEnd ||
        new Date(subscription?.currentPeriodEnd) < new Date())
    ) {

      subscription.plan = "free";
      await subscription.save();
    }

    const activePlan = PLANS[subscription?.plan || "free"];

    // 1. Meeting count
    const meetingCount = await Meeting.countDocuments({ creator: user.id });
    if (meetingCount >= activePlan.maxMeetings) {
      return res
        .status(403)
        .json({ message: "Meeting limit reached for your plan" });
    }

    // 2. Participant count
    if (
      req.body.participants &&
      req.body.participants.length > activePlan.maxParticipants
    ) {
      return res.status(403).json({
        message: `Max ${activePlan.maxParticipants} participants allowed`,
      });
    }

    next();
    
  } catch (err) {
    console.log('some error', err);
    next(err);
  }
};
