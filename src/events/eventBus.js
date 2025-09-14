import { EventEmitter } from "events";

const eventBus = new EventEmitter();

export default eventBus;


/*
using **EventEmitter (or any pub/sub pattern)** for those external side-effects has some **big benefits** compared to calling them directly inside the controller.

---

## 🔑 Benefits of using event emitters & listeners here

### 1. **Separation of concerns**

* Controller: only handles **DB logic + API response**.
* Listeners: handle **side-effects** (email, push, calendar).
  ➡️ Makes the codebase easier to read and maintain.

---

### 2. **Decoupling**

* Controller doesn’t “know” about the email/push/calendar implementation.
* You can **add, remove, or change** listeners without touching the controller.
  ➡️ Example: switch from Gmail → SES → SendGrid without modifying meeting controller.

---

### 3. **Error isolation**

* If sending an email fails, it won’t break the meeting creation flow (since it happens **after commit** in listeners).
* Errors in listeners can be logged/retried separately.
  ➡️ Keeps DB state consistent.

---

### 4. **Scalability**

* Adding more side-effects (e.g., Slack notification, SMS) = just attach another listener.
* No extra code inside controller.
  ➡️ EventBus = single place to “subscribe” to meeting events.

---

### 5. **Async flexibility**

* Listeners can run **synchronously** (fire-and-forget) or be replaced with **background job queues** (BullMQ, RabbitMQ, Kafka).
* Same controller, but side-effects scale for production workloads.
  ➡️ Controller doesn’t block waiting for email/Google API.

---

### 6. **Testability**

* You can test the controller by **mocking the event emitter** → no need to stub email/calendar/push every time.
* Each listener can be unit-tested in isolation.
  ➡️ Cleaner tests, faster CI.

---

### 7. **Future proof**

* Later, if you need **microservices**, your event emitter layer can be swapped with **Kafka / Redis PubSub / NATS** without changing business logic.
  ➡️ Smooth path to distributed architecture.

---

📌 **In short:**
Using EventEmitter here gives you **clean separation**, **flexibility**, and **future-proofing** while keeping your **transactions safe and atomic**.

---



*/