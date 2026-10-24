// Very small in memory limiter for login attempts: blocks after too many failures.
// Resets when the server restarts, which is fine for this project.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;
const attempts = new Map();

function keyFor(req, phone) {
  return `${req.ip}|${phone}`;
}

function isBlocked(req, phone) {
  const e = attempts.get(keyFor(req, phone));
  if (!e) return false;
  if (Date.now() > e.resetAt) {
    attempts.delete(keyFor(req, phone));
    return false;
  }
  return e.count >= MAX_FAILS;
}

function recordFail(req, phone) {
  const k = keyFor(req, phone);
  const e = attempts.get(k);
  if (!e || Date.now() > e.resetAt) attempts.set(k, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else e.count++;
}

function clear(req, phone) {
  attempts.delete(keyFor(req, phone));
}

module.exports = { isBlocked, recordFail, clear };
