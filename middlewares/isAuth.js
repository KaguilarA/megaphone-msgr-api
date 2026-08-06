export default function (req, res, next) {
  if (req.user) return next();

  return res.status(401).json({
    authenticated: false,
    error: "No autorizado",
  });
};
