// gateway.js
const express = require('express');
const axios = require('axios');
const { createClient } = require('soap');

const app = express();
const PORT = 3000;

// Middleware básico
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, SOAPAction'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  app.options('*', (req, res) => {
    res.sendStatus(200);
  });
    next();
});

// Rota para salvar música (SOAP + REST)
app.post('/save-music', async (req, res) => {
  try {
    // 1. Garante o salvamento no SOAP
    const soapResult = await callSoapService(req.body);
    
    // 2. Verifica se o SOAP realmente salvou
    if (!soapResult.dados || !soapResult.dados.id) {
      throw new Error('Falha ao verificar salvamento no SOAP');
    }
    
    const restResult = await axios.post(
      'http://localhost:8000/api/musica/',
      {
        nome: soapResult.dados.name,
        autor: soapResult.dados.artist,
        link: soapResult.dados.link,
      }
    );
    
    res.json({
    sistema: 'SOAP + REST',
    status: 'Música processada com sucesso',
    id_musica: restResult,
    aviso: 'Download disponível em /download',
  });
    const idMusica = restResult.data.id;

   
    
  } catch (error) {
    res.status(500).json({
      sistema: 'SOAP + Rest',
      error: 'Falha crítica no processamento',
      details: error.message,
      recovery_suggestion: 'Verifique os logs do serviço SOAP'
    });
  }
});

// Rota para download (proxy direto)
app.get('/download', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/api/musica/download/', {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', response.headers['content-disposition']);
    res.setHeader('nome_musica', response.headers['nome_musica'] || '');
    res.setHeader('nome_autor', response.headers['nome_autor'] || '');
    res.setHeader('Access-Control-Expose-Headers', 'nome_musica, nome_autor');

    response.data.pipe(res);
  } catch (error) {
    console.error('Erro no download:', error.message);
    res.status(500).json({ error: 'Falha no download', details: error.message });
  }
});


// Função para chamar serviço SOAP
async function callSoapService(data) {
  return new Promise((resolve, reject) => {
    console.log('Conectando ao WSDL...');
    createClient('http://localhost:9000/music?wsdl', 
      { disableCache: true }, // Adicione esta opção
      (err, client) => {
        if (err) {
          console.error('Erro ao criar cliente SOAP:', err);
          return reject(new Error('Serviço SOAP indisponível'));
        }

        console.log('Chamando método GetMusic...');
        client.MusicService.MusicPort.GetMusic({
          name: data.musica,
          artist: data.artista,
          link: data.link
        }, (err, result) => {
          if (err) {
            console.error('Erro na chamada SOAP:', err);
            return reject(new Error('Falha ao processar música'));
          }
          console.log('Resposta SOAP:', result);
          resolve(result);
        });
      }
    );
  });
}
app.listen(PORT, () => {
  console.log(`Gateway rodando em http://localhost:${PORT}`);
});