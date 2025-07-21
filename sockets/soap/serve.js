const soap = require('soap');
const fs = require('fs');
const http = require('http');
const path = require('path');


const service = {
    MusicService: {
        MusicPort: {
            GetMusic: function(args) {
                return {
                    dados: {
                        id: Math.floor(Math.random() * 10000),
                        name: args.name,
                        artist: args.artist,
                        link: args.link
        }
    };
}
        }
    }
};

const xml = fs.readFileSync(path.join(__dirname, 'musicService.wsdl'), 'utf8');
const server = http.createServer((request, response) => {
    response.end('404: Not Found');
});

try {
    soap.listen(server, {
        path: '/music',
        services: service,
        xml: xml,
        wsdlOptions: {
            escapeXML: false,
            returnFault: true
        }
    }, function(err) {
        if (err) {
            console.error('Erro ao iniciar servidor SOAP:', err);
            process.exit(1);
        }
        console.log('Servidor SOAP inicializado com sucesso');
    });
} catch (err) {
    process.exit(1);
}

server.listen(9000, function() {
    console.log('Servidor SOAP rodando em http://localhost:9000/music?wsdl');
});