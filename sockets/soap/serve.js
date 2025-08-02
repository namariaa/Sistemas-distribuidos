const soap = require('soap');
const http = require('http');

const service = {
  MusicService: {
    MusicPort: {
      StoreMusic: function(args) {
        console.log(`Armazenando: ${args.id} - ${args.nome}`);
        return { success: true, id: args.id };
      }
    }
  }
};

const xml = require('fs').readFileSync('musicService.wsdl', 'utf8');
const server = http.createServer((req, res) => res.end('404'));
soap.listen(server, '/music', service, xml);
server.listen(9000);