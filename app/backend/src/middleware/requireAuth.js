module.exports = function requireAuth(req, res, next) {
  if (!req.session?.pmgTicket) {
    return res.status(401).json({ error: 'not_authenticated' });
  }
  next();
};
