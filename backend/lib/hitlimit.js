// Small in memory limiter: at most `max` requests per `windowMs` for each client address.
function hitLimit(max, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const e = hits.get(req.ip);
    if (!e || now > e.resetAt) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    e.count++;
    if (e.count > max) return res.status(429).json({ message: "Too many requests, try again in a minute" });
    next();
  };
}

module.exports = hitLimit;
