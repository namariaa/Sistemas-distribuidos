const soap = require('soap');

const service = {
  MusicService: {
    MusicPort: {
      GetMusic: function(args, callback) {
        const name = args.name;
        const artist = args.artist;
        const link = args.link;
        const result = {
          name: name,
          artist: artist,
          link : link
        };
        callback(null, result);
      }
    }
  }
};

const server =  require('http').createServer(function (request, response) {
  response.end('404: Not Found');
});


const xml = require('fs').readFileSync('musicService.wsdl', 'utf8');

soap.listen(server, '/music', service, xml);

server.listen(8000, function () {
  console.log('SOAP server running at http://localhost:8000/music?wsdl');
});
