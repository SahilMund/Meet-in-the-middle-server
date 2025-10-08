# 🗓️ Meet in the Middle (Backend)

Meet in the Middle is a collaborative meeting scheduling and coordination platform.  
It helps users find optimal meeting times, share locations, manage invites, and integrate with Google Calendar and Stripe for premium subscriptions.

This repository contains the backend API built with Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 Secure authentication (JWT + Cookies + OAuth + Magic Links)
- 📅 Meeting creation, invitations, and scheduling
- 🧭 Equidistant meeting point calculation
- 📬 Email & push notifications
- 📈 Dashboard statistics and activity tracking
- 💳 Stripe subscription & billing integration
- 🗄️ Cloudinary media storage
- 🧾 PDF & Excel report generation
- ⚡ Real-time updates with Socket.IO
- 🧰 Swagger API documentation



## 🧰 Tech Stack
## Server
- **Node.js** – JavaScript runtime environment  
- **Express.js** – Web framework for APIs and web servers  
- **Mongoose** – MongoDB object data modeling  
- **JWT (jsonwebtoken)** – Authentication & authorization  
- **Passport.js** – Authentication middleware  
  - Google OAuth 2.0  
  - Facebook Login  
- **bcrypt** – Password hashing and encryption  

### Database & Storage
- **MongoDB** – NoSQL database  
- **Cloudinary** – Image and video storage  
- **Stripe** – Payment gateway integration  

### Utilities & Middleware
- **cors** – Cross-Origin Resource Sharing  
- **helmet** – HTTP security headers  
- **compression** – Gzip compression for performance  
- **hpp** – Prevents HTTP parameter pollution  
- **cookie-parser** – Cookie handling  
- **body-parser** – Request body parsing  
- **express-rate-limit** – API rate limiting  
- **multer** – File uploads  
- **sharp** – Image processing  
- **fs-extra** – File system utilities  
- **node-cron** / **node-schedule** – Task scheduling  
- **moment** – Date/time formatting  
- **uuid** – Unique ID generation  
- **web-push** – Push notifications  
- **archiver** – File compression  

### Documentation
- **Swagger (swagger-jsdoc + swagger-ui-express)** – API documentation  

### Email & Notifications
- **Nodemailer** – Email sending service  

### Google APIs
- **googleapis** – Integrations like Google Drive or Sheets  

### PDF & Excel
- **pdfkit** – PDF generation  
- **exceljs** – Excel file creation and manipulation  

### Real-time Communication
- **Socket.IO** – Real-time communication (chat, notifications, etc.)  

### Code Quality & Development
- **ESLint** – Code linting  
- **Prettier** – Code formatting  
- **Nodemon** – Auto-restart during development  





## ⚙️ Installation & Setup

Follow the steps below to set up and run the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mtm-server.git
cd mtm-server
```
### 2. Install dependencies
```bash
npm install
```


### 3. Enviorment Variables
    MONGODB_URI=
    PORT = 
    FRONTEND_URL = 
    BACKEND_URL= 

    NODE_MAILER_MAIL = 
    NODE_MAILER_PASSWORD = 

    # JWT_SECRET_KEY
    JWT_SECRET_KEY = 
    JWT_EXPIRY = 
    JWT_REFRESH_SECRET_KEY= 
    JWT_REFRESH_EXPIRY=

    # cloudinary credentials
    CLOUDINARY_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    #google-sso
    GOOGLE_CLIENT_ID =
    GOOGLE_CLIENT_SECRET= 
    GOOGLE_CALLBACK = 

    #facebook-sso
    FACEBOOK_CLIENT_ID= 
    FACEBOOK_CLIENT_SECRET=
    FACEBOOK_CALLBACK= 

    
    NODE_ENV = development

    VAPID_PUBLIC_KEY=
    VAPID_PRIVATE_KEY=

    GOOGLE_PLACES_API_KEY=

    STRIPE_SECRET_KEY=
    STRIPE_WEBHOOK_SECRET=

### 4. Run the development server
```bash
npm run dev
```

# User Functionalities
### 1. Login 

- we get the body (email,password,remeberme}
- check whether the user is existing or not and compare the passowords using bcrypt.compare(enteredPassword,password in database)
- Then update the user prefernces using findOneAndUpdate
- Now you get the device info to give alerts if user logged in multiple devices for that we use **useragent** and if user is logged in multiple devices the it sends the email to the original user and update the current device info to userSchema
- After that create the jwt token using **jwt**
- So this is a cookie based authentication ,we can store this token in cookies ,so please mention options ,In the options there is a property called maxAge based on this the cookie is session cookie or persistant cookie
- create the refresh token also once the our original token expired,then the refresh token creates the normal token again and we also store like this res.cookie(”refresh token”,refreshToken,options)
- Get the login details (`email`, `password`, `rememberMe`) from the request body.
- Find the user in the database and compare the entered password with the stored hash using **bcrypt.compare**.
- Update the user’s preferences (like rememberMe) and store device info using **useragent**; send an alert if multiple devices are detected.
- Generate a **JWT access token** and store it in a cookie; use `maxAge` to decide whether it’s a session or persistent cookie.
- Create a **refresh token**, also stored in a cookie, to issue a new access token when the old one expires.
- Return success response with tokens set in cookies, completing cookie-based authentication.


### 2. Uploading the Images

- for uploading the images we use multer and cloudinary and sharp
- create your folder automatically using multer
- The multer is  middleware to parse the multipart/form-data and we use sharp to reisize the image and stored in local server
- Then we upload the resized file url into cloudinary it gives the public image url and we update in database.
- And simply remove the old avatar from the cloudinary

### 3.Delete the Avatar

- For deleting the avatar ,first we check whether the user is logged in or not
- Then we get the avatar from the database and we get the url,which has publicId
- for deleting the avatar,we can delete in cloudinary and database as well as
- for deleting ,we can extract the publicId and destroy with publicId and updating In the database as well as

### 4.Delete User

- first set the deletion periods days in milliseconds then update the isDeletedField ,then send the conformation email to the user
- Schedule job at `runAt` (future date).
- When job executes:
    - Find all participants linked to the user.
    - Remove user from all meetings.
    - Delete participant records.
    - Delete user preferences and account.
    - Send final email.
    - Log success or errors.
- Client is informed that deletion is **scheduled**, not immediate.

### 5.Magic Link

- first we get the email from the body ,then check whether the user existing or not
- Then generate the magicToken with the help of user email and user id and expires in 10m
- Now construct the URL using URL object,then attach the magic token to that URL
- Then send the MagicLink to the respective user

### 6.Verify magic Link

- first you get the token from req.params
- Then decoded the token and we get the id and email
- After this genrate the login jwt token using id and email
- Then check the device detection also and update the current login date and current device info
- Then keep this login token in cookie
- Then create the frontend url using new URL after creating the redirecting url using frontend url and “/home”
- Then simply redirect it


### 7. Worker(child process)

- In normal js __dirname gives the current folder path and __filename gives the current file path
- But node.js does not give directly
- There is fileURLToPath(import.meta.url) gives  file path
- There is dirname(filepath) it gives folder path
- **await fse.ensureDir(REPORTS_DIR);**what is does is,if the folder is not created Yet then it creates suppose the folder is already created do nothing

# Meeting Functionalities

## 🟢 `createMeeting`

- Validates the incoming request body using **Joi schema** (title, time, participants, etc.).
- Starts a **MongoDB transaction** with `mongoose.startSession()` to ensure atomicity.
- Fetches the **creator user** from DB, and if not found → unauthorized.
- Creates a **new meeting document** with title, description, creator, and timings.
- Generates a **meeting link** using `process.env.FRONTEND_URL`.
- Prepares **participants list**:
    - Adds participants excluding the creator.
    - Ensures if participant email exists, links to existing user.
    - Creator is added as an "Accepted" participant with location.
- Inserts all participants into DB (`insertMany`) and links them to the meeting.
- Commits the transaction, emits a `meetingCreated` event, and responds with success.

---

## 🟢 `getMeetings`

- Extracts logged-in user’s email.
- Applies pagination (`pageNo`, `items`) to fetch data in chunks.
- Finds all `Participant` entries where the user is a participant.
- Populates linked **meeting data, creator details, and participant info**.
- If no meetings found, returns `"No Meetings found"`.
- Otherwise, returns all meetings with populated data.

---

## 🟢 `getPendingMeetings`

- Gets logged-in user’s email and pagination.
- Finds **pending invitations** where status = `"Pending"`.
- Populates meeting + creator + participants info.
- Filters out duplicate meetings using `Map`.
- Returns a **formatted list** (id, title, host name, description, people count, date, time).
- Helps user quickly see which meetings are still **awaiting their response**.

---

## 🟢 `deleteMeeting`

- Takes `meetingId` from request params.
- Checks if meeting exists, else returns "Meeting not found".
- Deletes the **meeting document** and its participants.
- Loops through participants and **sends notifications** about cancellation.
- Builds **cancellation email HTML** and sends via `sendMeetingInvitationMail`.
- Responds with `"Meetings deleted successfully!"`.

---

## 🟢 `getMeetingById`

- Takes `meetingId` from params.
- Finds meeting by ID and **populates creator + participants**.
- If not found, returns `"Meeting not found"`.
- Otherwise, returns meeting details.

---

## 🟢 `editMeetingById`

- Finds meeting by `meetingId`.
- Updates **title and description** from request body.
- Saves updated meeting.
- Prepares **new invitation email HTML** with updated info.
- (Sending mail is currently commented out.)
- Responds with updated meeting.

---

## 🟢 `acceptMeeting`

- Extracts `meetingId` + location from request body, and logged-in user’s email.
- Finds the participant for this meeting.
- Prevents the **creator from accepting their own meeting**.
- If participant exists, sets status = `"Accepted"` and saves location.
- Notifies the creator that someone **accepted their invitation**.
- Responds with success message.

---

## 🟢 `rejectMeeting`

- Similar to `acceptMeeting`, but sets status = `"Rejected"`.
- Prevents the **creator from rejecting their own meeting**.
- Notifies the creator that participant **rejected** the meeting.
- Responds with success.

---

## 🟢 `conflicts`

- Finds the current meeting by `meetingId`.
- Fetches all participations for logged-in user (except Rejected ones).
- Compares times to check if **current meeting overlaps with others**.
- Returns conflicts (list of overlapping meetings).
- If none, says `"No conflicts found"`.

---

## 🟢 `dashboardStats`

- Builds user dashboard statistics:
    - Total meetings.
    - Upcoming meetings.
    - Pending invitations.
    - Meetings in current week.
    - Average participants per meeting.
    - Success rate (Accepted ÷ Total).
- Uses filters and calculations on `Participant` + `Meeting`.
- Returns a neat stats object.

---

## 🟢 `upcomingMeetings`

- Fetches participations of user.
- Filters only meetings with **future scheduledAt** date.
- Returns upcoming meetings with full details.

---

## 🟢 `recentActivity`

- Gets user’s recent activity:
    - Meetings created by user.
    - Participant actions (accept/reject) by user.
- Maps into activity objects (`type`, `user`, `target`, `timestamp`).
- Merges and sorts by latest timestamp.
- Returns a timeline-style activity feed.

---

## 🟢 `scheduleMeetingReminder`

- Takes `meetingId`.
- Finds meeting and participants.
- Filters participants with `status="Accepted"` and reminders enabled.
- Schedules **email reminders** at:
    - 1 day before.
    - 3 hours before.
- Uses `node-schedule` for scheduling.

---

## 🟢 `confirmationRemainder`

- Similar to reminders but for `"Pending"` participants.
- Calls `scheduleConfirmationRemainder` utility to send confirmation reminders.

---

## 🟢 `calculateEquidistantPoint`

- Finds meeting and participants with Accepted + location data.
- If at least 2 participants exist → calculates **average latitude and longitude**.
- Returns the **midpoint (equidistant point)**.
- Useful for deciding a **central meeting spot**.

---

## 🟢 `acceptedParticipantsLocations`

- Fetches all Accepted participants with valid locations.
- Maps each into `{ name, email, lat, lng, placeName }`.
- Returns list of locations (for maps).

---

## 🟢 `nearByPlaces`

- Finds meeting, gets Accepted participants with location.
- Calculates equidistant point.
- Calls **Overpass API** (or Google Places) to fetch nearby places (`type=restaurant`, etc.).
- Returns list of nearby places (for meeting venue suggestions).

## 🔹 Function: `sendOTP`

👉 **Purpose:** Generate a one-time password (OTP), save/update it in the database, and send it to the user’s email.

### Step-by-step explanation:

- `const email = req.body.email;` → Get the user’s email from the request body.
- `const otp = crypto.randomInt(100000, 999999).toString();` → Generate a secure random 6-digit OTP (better than `Math.random()`).
- `await OtpModel.findOneAndUpdate(...)` → Store OTP in the `OtpModel` collection.
    - If the email already exists → update the OTP and `createdAt`.
    - If not → create a new OTP record (thanks to `upsert: true`).
- `await sendVerificationEmail(email, otp);` → Send the OTP to the user’s email.
- `res.status(201).json({ message: "OTP sent successfully" });` → Respond back to the client confirming OTP was sent.
- If anything goes wrong → `catch (error)` returns a 500 error with `"Failed to send OTP"`.

👉 **In short:** This function **creates and sends a 6-digit OTP** to the user’s email, ensuring only one record per email is stored (update/insert).

---

## 🔹 Function: `verifyOTP`

👉 **Purpose:** Verify if the OTP is valid, create a new user, set their preferences, and send a welcome mail.

### Step-by-step explanation:

- `const { email, otp, password, name } = req.body;` → Extract input values from request.
- `const otpData = await OtpModel.findOne({ email, otp });` → Check if the OTP exists for the given email.
    - If not found → return `"Invalid OTP"`.
- Compare `createdAt` with current time → ensure OTP is not expired (`>6000 sec`).
    - If expired → return `"OTP expired"`.
- `const existingUser = await UserModel.findOne({ email });` → Make sure the user doesn’t already exist.
    - If exists → return `"Email already exists"`.
- `const user = await UserModel.create({...})` → Create a new user with name, email, and password.
- `await OtpModel.deleteOne({ email });` → Remove OTP record after successful use (one-time only).
- `const userSettingsNew = await Preferences.create({ userId: user._id });` → Create default preferences/settings for the new user.
- `await UserModel.findByIdAndUpdate(user._id, { settings: userSettingsNew._id });` → Link the preferences to the user account.
- `sendWelComeMail(email)` → Send a welcome email (done asynchronously, doesn’t block response).
- Finally → `res.status(200).json({ message: "OTP verified successfully" });`.
- If any error happens in between → `catch` block logs it and returns `"Failed to verify OTP"`.

## 🔹 Function: `createCheckoutSession`

👉 **Purpose:** Create a Stripe checkout session so the user can start a subscription (like Premium plan).

### Step-by-step explanation:

- `const session = await stripe.checkout.sessions.create({...})` → Creates a new checkout session with Stripe.
- `customer_email: req.user.email` → Uses the logged-in user’s email for Stripe billing.
- `payment_method_types: ["card"]` → Allows card payments only.
- `mode: "subscription"` → Tells Stripe this is a **recurring subscription** (not one-time).
- `line_items: [{ price: PLANS.premium.priceId, quantity: 1 }]` → Defines what the user is buying:
    - Uses the `priceId` from your `PLANS` config (Premium plan).
    - Quantity is 1 (one subscription).
- `success_url` → If payment is successful, Stripe will redirect to `/subscription-success`.
- `cancel_url` → If user cancels checkout, redirect to `/subscription-cancel`.
- `billing_address_collection: "required"` → Forces user to enter billing address.
- `metadata: { userId: req.user.id }` → Attach the user’s ID for tracking (helpful in webhooks).
- `res.json({ url: session.url })` → Send the session URL back so the frontend can redirect the user to Stripe checkout.
- If something fails → `catch` block returns a `500` error with the error message.

👉 **In short:** This function creates a Stripe checkout session where the logged-in user can subscribe to your Premium plan.

---

## 🔹 Function: `createBillingPortalSession`

👉 **Purpose:** Allow users to manage their subscription (update card, cancel plan, etc.) via Stripe’s billing portal.

### Step-by-step explanation:

- `const userId = req.user.id;` → Get the currently logged-in user’s ID.
- `const subscription = await Subscription.findOne({ user: userId });` → Find the subscription document in your DB for this user.
- `if (!subscription || !subscription.stripeCustomerId)` → Check if this user has an active Stripe customer account.
    - If not → return error `"No active Stripe customer found"`.
- `const portalSession = await stripe.billingPortal.sessions.create({...})` → Create a new Stripe **billing portal session**.
- `customer: subscription.stripeCustomerId` → Connect this session to the user’s Stripe account.
- `return_url: \`${process.env.FRONTEND_URL}/account``→ After managing subscription, user comes back to`/account`.
- `res.json({ url: portalSession.url })` → Send the billing portal URL to frontend.
- If anything fails → log the error and return `500` with error message.

👉 **In short:** This function lets a user open Stripe’s billing portal so they can manage their subscription details themselves.

## Models

### 🔹 Meeting Model (`Meeting`)

- Stores meeting details like **title, description, creator, participants, and meeting link**.
- Has fields for **scheduled time, end time, and location suggestions**.
- Indexes created for fast lookups → by **creator, participants, or date/time**.
- Used in dashboards, reminders, invites, and analytics.

---

### 🔹 Notification Model (`Notification`)

- Stores **alerts/notifications** for users (meeting created, accepted, rejected, deleted).
- Linked to a **user** (receiver) and contains **message + extra data** (like meetingId).
- `isRead` flag tracks whether a notification is seen.
- Auto timestamps help in sorting notifications by time.

---

### 🔹 OTP Model (`Otp`)

- Stores **email + OTP code** for verification/authentication.
- `createdAt` has TTL index → OTP auto-expires after **10 minutes**.
- Indexed for **fast OTP validation** and fetching latest OTP.
- Used in **login, signup, and password reset flows**.

---

### 🔹 Participant Model (`Participant`)

- Represents a **meeting invitee** (linked to a user and a meeting).
- Tracks invitee’s **status** (Pending/Accepted/Rejected) and **location**.
- Supports **conflict reasons** (if invitee can’t attend at certain times).
- Indexed for fast queries (by email, meeting, or status) and prevents duplicate invites.

---

### 🔹 Preferences Model (`Preferences`)

- Stores a user’s **settings/preferences** (notifications, reminders, profile visibility).
- Linked **1-to-1 with a user** (unique `userId`).
- Default values provided for all toggles (like email notifications ON by default).
- Indexed on `userId` for **fast fetch/update** in settings.

---

### 🔹 PushSubscription Model (`PushSubscription`)

- Stores **push notification subscription data** (email, endpoint, encryption keys).
- Used for **Web Push API** to send browser/device notifications.
- Links subscription to a **user’s email**.
- Auto timestamps → track when a subscription was created.

---

### 🔹 Subscription Model (`Subscription`)

- Stores **Stripe subscription details** (customerId, subscriptionId, plan).
- Tracks **plan type** (free/premium), billing status, and renewal date.
- Keeps subscription **status** (active, canceled, trialing, etc.).
- Linked to a user for billing and access control.

---

### 🔹 User Model (`User`)

- Stores **user profile info** (name, email, password, avatar, bio, etc.).
- Handles **auth providers** (local, Google, Facebook) and login devices.
- Includes **password hashing + compare method** (using bcrypt).
- Indexed for fast lookups (by email, provider, IP) → used in authentication.

## Routes

## 🔹 Forgot Password Routes (`forgotPassword.route.js`)

- **`POST /forgot-password`** → Allows logged-in user to request a reset password link.
    - Finds the user by email.
    - Generates a reset token (15 min expiry).
    - Sends reset link to user’s email.
- **`POST /reset-password/:token`** → Resets password using the token.
    - Validates token and expiry.
    - Updates user’s password and clears token.
    - Sends success response.

---

## 🔹 Notifications Routes (`notifications.route.js`)

- **`POST /notifications/subscribe`** → Subscribe to push notifications.
    - User must be logged in.
    - Saves push subscription (for web/device notifications).

---

## 🔹 Index Routes (`index.routes.js`)

- Groups all routes under `/api/...`.
- **`/user`** → user-related actions (profile, settings, avatar).
- **`/meeting`** → meeting-related actions (create, edit, delete, stats).
- **`/auth`** → login, logout, OAuth, magic links, tokens.
- **`/verification`** → OTP verification for signup/email.
- **`/notifications`** → push subscription.
- **`/stripe`** → payments and billing.

---

## 🔹 Meeting Routes (`meeting.routes.js`)

- **`POST /createMeeting`** → Create new meeting (with plan limits).
- **`GET /getMeetings`** → Fetch user’s meetings.
- **`GET /getPendingMeetings`** → Get meetings awaiting response.
- **`GET /getMeetingById/:meetingId`** → Get details of one meeting.
- **`DELETE /deleteMeeting/:meetingId`** → Delete a meeting.
- **`PUT /editMeeting/:meetingId`** → Edit meeting details.
- **`PUT /acceptMeeting`** → Accept an invite.
- **`PUT /rejectMeeting`** → Reject an invite.
- **`GET /conflicts/:meetingId`** → Check conflicts in schedule.
- **`GET /getDashBoardStats`** → Meeting stats for dashboard.
- **`GET /getUpCommingMeetings` / `/upcomingMeetings`** → List upcoming meetings.
- **`GET /getRecentActivity` / `/recentActivity`** → Show meeting-related activity.
- **`GET /scheduleMeetingReminder`** → Schedule reminders for meetings.
- **`GET /confirmationRemainder`** → Confirmation reminder for participants.
- **`GET /calculateEquidistantPoint/:meetingId`** → Find equidistant meeting point.
- **`GET /getNearByPlaces/:meetingId`** → Suggest nearby meeting places.

---

## 🔹 Stripe Routes (`stripe.route.js`)

- **`POST /create-checkout-session`** → Create Stripe checkout session for upgrade.
- **`POST /create-portal-session`** → Open billing portal (manage subscription).

---

## 🔹 User Routes (`user.route.js`)

- **`POST /login`** → Login user, return tokens.
- **`POST /logout`** → Logout user (clear tokens).
- **`GET /currUserInfo`** → Get logged-in user info.
- **`POST /uploadAvatar`** → Upload user avatar.
- **`POST /deleteAvatar`** → Delete avatar.
- **`PUT /updateUserInfo`** → Update profile info.
- **`GET /getUserSettings`** → Fetch user preferences.
- **`PUT /putUserSettings`** → Update user preferences.
- **`PUT /deleteUser`** → Schedule account deletion.
- **OAuth**:
    - `GET /google` → Start Google login.
    - `GET /google/callback` → Handle Google callback.
    - `GET /facebook` → Start Facebook login.
    - `GET /facebook/callback` → Handle Facebook callback.
- **Tokens**:
    - `POST /refreshAccessToken` → Refresh JWT.
    - `POST /sendMagicLink` → Send magic login link.
    - `GET /verifyMagicLink` → Verify magic login link.

---

## 🔹 Verification Routes (`verificationOTP.route.js`)

- **`POST /sendOtp`** → Send OTP to user email (for signup).
- **`POST /verifyOtp`** → Verify OTP → create user profile if valid.

---

## 🔹 Stripe Webhook Routes (`webhook.route.js`)

- **`POST /webhook`** → Handle Stripe events (subscription updates, payments).
    - Uses raw body parser for Stripe signature validation.

## Services

## 🔹 `createGoogleCalendarEvent`

*(Creates and pushes a meeting event into the user’s Google Calendar)*

- **Fetch user tokens** → Finds the user in the DB by `userId` to check if they have Google OAuth tokens (needed to talk to Google Calendar).
- **Skip if no tokens** → If tokens are missing, it logs and exits (so app doesn’t break for users without Google sync).
- **Setup OAuth2 client** → Creates an OAuth2 client using Google client ID, secret, and callback URL from `.env`.
- **Attach tokens to client** → Sets the access + refresh token from the user’s DB record into the OAuth client.
- **Initialize Calendar API** → Prepares Google Calendar API (`google.calendar`) with the authorized client.
- **Define event details** → Builds an event object with:
    - `summary` → meeting title.
    - `description` → custom or default description.
    - `start` and `end` times → in ISO format, with timezone.
    - `attendees` → meeting creator and participants’ emails.
    - `reminders` → email reminder (1 day before) + popup reminder (10 min before).
- **Insert event into Google Calendar** → Calls `calendar.events.insert()` with `sendUpdates: "all"` to notify participants.
- **Return success or failure** → Logs and returns event link on success, or logs an error if failed.

---

## 🔹 `createAndSendNotification`

*(Creates a notification record in DB and sends it instantly via WebSocket)*

- **Check user preferences** → Finds the user’s notification preferences in DB, specifically if `inAppNotification` is enabled.
- **Skip if disabled** → If user has disabled in-app notifications, it logs and returns without sending.
- **Create notification in DB** → Adds a new record in `Notification` collection with `userId`, `type`, `message`, and optional `data`.
- **Prepare real-time message** → Constructs notification payload with `_id`, `type`, `message`, `data`, `isRead`, and `createdAt`.
- **Emit via Socket** → Uses `sendNotification` (from socket config) to push the notification in real time to the user’s active sessions.
- **Log success** → Prints in console for debugging (`Notification sent: ...`).
- **Handle errors** → If DB save or socket fails, it catches and logs the error.
