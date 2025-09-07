// middlewares/security.middleware.js
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

const isProd = process.env.NODE_ENV === "production";

/**
 * Helmet: Helps secure Express apps by setting HTTP headers.
 * - Protects against well-known web vulnerabilities like XSS, clickjacking, etc.
 * - `contentSecurityPolicy` is disabled in dev (because React/Vite/Next.js hot reload may break),
 *   but should be enabled in production for strong protection.
 */
const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: isProd, // Enable only in production
});

/**
 * CORS (Cross-Origin Resource Sharing):
 * - Restricts which frontend domains can access this API.
 * - Prevents unauthorized domains from making requests.
 * - In dev: defaults to React frontend (http://localhost:5173).
 * - `credentials: true` allows sending cookies (needed for auth).
 */
const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

/**
 * Rate Limiter:
 * - Prevents brute-force attacks and abuse (e.g., too many login attempts).
 * - Limits each IP to `max` requests per `windowMs`.
 * - Disabled in development (`skip`) to make testing easier.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { status: 429, error: "Too many requests, try later." },
  skip: () => !isProd, // Disable in development
});

/**
 * HPP (HTTP Parameter Pollution):
 * - Prevents attackers from sending multiple parameters with the same name
 *   (e.g., /api/user?id=1&id=2).
 * - Protects query parsing and logic errors.
 */
const hppMiddleware = hpp();

/**
 * Export security middlewares as an array
 * - So we can `app.use(securityMiddleware)` in server.js
 */
export const securityMiddleware = [
  helmetMiddleware,
  corsMiddleware,
  limiter,
  hppMiddleware,
];
