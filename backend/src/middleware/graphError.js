// backend/src/middleware/graphError.js
export const handleGraphError = (err, req, res, next) => {
  if (err.code?.startsWith('Neo.')) {
    return res.status(500).json({
      error: 'Graph database error',
      details: err.message
    });
  }
  next(err);
};