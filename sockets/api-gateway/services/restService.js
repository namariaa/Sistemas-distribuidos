const axios = require("axios");

function proxyToRest(endpoint) {
  return async (req, res) => {
    try {
      const response = await axios.get(`http://localhost:8000${endpoint}`, {
        responseType: "stream",
        headers: req.headers,
      });

      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      response.data.pipe(res);
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  };
}

module.exports = { proxyToRest };
