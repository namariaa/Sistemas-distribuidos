const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Proxy para o backend Django REST
app.use("/api/music", createProxyMiddleware({
  target: "http://localhost:8000",
  changeOrigin: true,
}));

// Proxy para o backend SOAP 
app.use("/api/music-soap", createProxyMiddleware({
  target: "http://localhost:9000", 
  changeOrigin: true,
}));

app.listen(3000, () => {
  console.log("API Gateway rodando em http://localhost:3000");
});
