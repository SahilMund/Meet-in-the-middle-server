import compression from "compression";

/**
 * Compression Middleware:
 * - Uses Gzip/Brotli to reduce response size.
 * - Improves load times and saves bandwidth.
 * - Skips compressing small responses (<1KB).
 * - Allows clients to opt out via "x-no-compression" header.
 */
const compressionMiddleware = compression({
  level: 6, // Balanced: smaller size but not too CPU heavy
  threshold: 1024, // Only compress if body > 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false; // Respect client opt-out
    }
    return compression.filter(req, res);
  },
});

export const performanceMiddleware = [compressionMiddleware];
