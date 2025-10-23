function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'mysecretapikey') {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }
  next();
}
module.exports = auth;
