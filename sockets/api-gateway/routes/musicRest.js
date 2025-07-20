const express = require("express");
const { proxyToRest } = require("../services/restService");

const router = express.Router();

router.get("/download", proxyToRest("/api/musica/download/"));
router.get("/imagem", proxyToRest("/api/musica/imagem/"));

module.exports = router;
