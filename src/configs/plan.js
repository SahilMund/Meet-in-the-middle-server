// config/plans.js
export const PLANS = {
  free: {
    maxMeetings: 11,
    maxParticipants: 5,
    priceId: null, // free → no Stripe product
  },
  premium: {
    maxMeetings: 15,
    maxParticipants: 50,
    priceId: "price_1S6HLqSEBjlXJGIYA4IsAJS7", // replace with your Stripe Price ID
  },
};
