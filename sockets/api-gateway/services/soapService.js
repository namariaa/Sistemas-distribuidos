const soap = require("strong-soap").soap;

const WSDL_URL = "http://localhost:8000/music?wsdl"; // URL do WSDL

function callSoapService(data) {
  return new Promise((resolve, reject) => {
    soap.createClient(WSDL_URL, (err, client) => {
      if (err) return reject(err);

      client.GetMusic(data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

module.exports = { callSoapService };
