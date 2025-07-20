const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const musicRestRoutes = require("./routes/musicRest");
const musicSoapRoutes = require("./routes/musicSoap");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/music", musicRestRoutes);      // Proxy para Django REST
app.use("/api/music-soap", musicSoapRoutes); // Requisições SOAP

app.listen(3000, () => {
  console.log("API Gateway rodando em http://localhost:3000");
});
