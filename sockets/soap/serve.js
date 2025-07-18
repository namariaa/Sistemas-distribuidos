const soap = require('soap');

const service = {
  MusicService: {
    MusicPort: {
      GetMusic: function(args, callback) {
        const location = args.location;
        const temperature = '25°C';
        const description = 'Sunny';

        // Return the response
        const result = {
          temperature: temperature,
          description: description
        };
        callback(null, result);
      }
    }
  }
};

const xml = require('fs').readFileSync('musicService.wsdl', 'utf8');
const server = soap.listen({ path: '/weather', xml: xml }, function() {
  console.log('SOAP server running at http://localhost:8000/weather?wsdl');
});

server.addService(xml, service, { suppressStack: true });