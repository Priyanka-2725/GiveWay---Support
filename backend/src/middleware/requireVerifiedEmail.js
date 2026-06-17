function requireVerifiedEmail(req, res, next) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ message: 'Email verification required' });
  }
  return next();
}

module.exports = { requireVerifiedEmail };
