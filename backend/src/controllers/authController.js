const { env } = require('../config/env');
const authService = require('../services/authService');
const { asyncHandler, toPublicUser } = require('../utils/http');

function setAuthCookie(res, token) {
  res.cookie(env.jwtCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 15,
  });
}

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ message: 'User created. Check your email to verify your account.', user: toPublicUser(user), token });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.json({ message: 'Login successful', user: toPublicUser(user), token });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.jwtCookieName);
  res.json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token || req.query.token);
  res.json({ message: 'Email verified', user: toPublicUser(user) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'If an account exists, a reset email has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.json({ message: 'Password reset successful' });
});

module.exports = { register, login, logout, me, verifyEmail, forgotPassword, resetPassword };
