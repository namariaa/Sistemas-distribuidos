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
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Rota para salvar música (SOAP + REST)
app.post('/save-music', async (req, res) => {
  try {
    // 1. Chamar serviço SOAP
    const soapResult = await callSoapService(req.body);
    
    // 2. Enviar para Django REST
    const restResponse = await axios.post('http://localhost:8000/api/musica/', {
      nome: soapResult.name,
      autor: soapResult.artist,
      link: soapResult.link
    });
    
    // 3. Responder ao frontend
    res.json(restResponse.data);
  } catch (error) {
    console.error('Erro no gateway:', error.message);
    res.status(500).json({ error: 'Falha no gateway', details: error.message });
  }
});

// Rota para download (proxy direto)
app.get('/download', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/api/musica/download/', {
      responseType: 'stream'
    });
    
    // Repassar headers importantes
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', response.headers['content-disposition']);
    res.setHeader('nome_musica', response.headers['nome_musica'] || '');
    res.setHeader('nome_autor', response.headers['nome_autor'] || '');
    
    // Repassar o stream de dados
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro no download:', error.message);
    res.status(500).json({ error: 'Falha no download', details: error.message });
  }
});

// Rota para imagem (proxy direto)
app.get('/imagem', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/api/musica/imagem/');
    res.json(response.data);
  } catch (error) {
    console.error('Erro na imagem:', error.message);
    res.status(500).json({ error: 'Falha ao obter imagem', details: error.message });
  }
});

// Função para chamar serviço SOAP
async function callSoapService(data) {
  return new Promise((resolve, reject) => {
    createClient('http://localhost:9000/music?wsdl', (err, client) => {
      if (err) return reject(err);
      
      client.MusicService.MusicPort.GetMusic(data, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}


app.listen(PORT, () => {
  console.log(`Gateway rodando em http://localhost:${PORT}`);
});