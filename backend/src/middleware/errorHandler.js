function errorHandler(err, req, res, next) {
  if (err.name === 'ZodError') {
    return res.status(400).json({ message: 'Invalid request', issues: err.issues });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Record already exists' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return res.status(status).json({ message });
}

module.exports = { errorHandler };
