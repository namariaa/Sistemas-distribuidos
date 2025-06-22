const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Carrega o .proto
const packageDefinition = protoLoader.loadSync('genio.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDefinition);

// Cria o cliente apontando para o servidor Python
const client = new proto.GenioService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Faz a chamada para o método chamaAPI
client.chamaAPI({ resposta: 'Minha resposta aqui' }, (err, response) => {
  if (err) {
    console.error('Erro ao chamar a API:', err);
  } else {
    console.log('Resposta do servidor:');
    console.log('mensagem:', response.mensagem);
    console.log('fim_jogo:', response.fim_jogo);
    console.log('personagem:', response.personagem);
    console.log('descricao:', response.descricao);
    console.log('foto:', response.foto);
  }
});
