export function responseHelpers(req, res, next) {
  res.success = (data, status = 200) => res.status(status).json({ ok: true, data });
  res.fail = (status = 400, message = 'Bad Request', extra) =>
    res.status(status).json({ ok: false, error: { message, ...extra } });
  next();
}