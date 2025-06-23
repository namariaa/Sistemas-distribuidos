const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  '10.25.2.150:50051',
  grpc.credentials.createInsecure()
);

// Faz a chamada para o método chamaAPI
const call = client.chamaAPI();

call.on('data', (response) => {
  if (response.fim_jogo) {
    if (response.personagem) {
      console.log('\n--- FIM DE JOGO ---');
      console.log('Personagem:', response.personagem);
      console.log('Descrição:', response.descricao);
    } else {
      console.log('\nErro:', response.mensagem);
    }
    call.end();
    rl.close();
  } else {
    console.log('\nGenio:', response.mensagem);
    rl.question('Sua resposta (s/n/sla/p/pn/v): ', (answer) => {
      call.write({ resposta: answer.trim().toLowerCase() });
    });
  }
});

call.write({ resposta: "" });  