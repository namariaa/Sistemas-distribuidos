const express = require("express");
const { callSoapService } = require("../services/soapService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await callSoapService(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
