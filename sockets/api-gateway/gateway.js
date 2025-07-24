const express = require('express');
const axios = require('axios');
const { createClient } = require('soap');

const app = express();
const PORT = 3000;

const REST_API_BASE = 'http://127.0.0.1:8000/api/'; 

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  app.options('*', (req, res) => res.sendStatus(200));
  next();
});

app.post('/save-music', async (req, res) => {
  try {
    const soapResult = await callSoapService(req.body);
    
    if (!soapResult?.dados?.id) {
      throw new Error('Resposta inválida do SOAP');
    }

    const restResult = await callRestService('musica/', 'POST', {
      nome: soapResult.dados.name || req.body.musica,
      autor: soapResult.dados.artist || req.body.artista,
      link: soapResult.dados.link || req.body.link
    });

    res.json({
      sistema: 'SOAP + REST',
      status: 'Música processada com sucesso',
      id_musica: restResult.id,
      aviso: 'Download disponível em /download',
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
    res.status(500).json({
      error: 'Falha no processamento',
      details: error.message,
      ...(error.details && { rest_details: error.details }),
      ...(error.response && { soap_details: error.response })
    });
  }
});

app.get('/download', async (req, res) => {
  try {
    const response = await axios.get(`${REST_API_BASE}musica/download/`, {
      responseType: 'stream'
    });

    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': response.headers['content-disposition'],
      'nome_musica': response.headers['nome_musica'] || '',
      'nome_autor': response.headers['nome_autor'] || '',
      'Access-Control-Expose-Headers': 'nome_musica, nome_autor'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ 
      error: 'Falha no download', 
      details: error.message 
    });
  }
});

async function callSoapService(data) {
  return new Promise((resolve, reject) => {
    createClient('http://localhost:9000/music?wsdl', 
      { disableCache: true },
      (err, client) => {
        if (err) return reject(new Error('Serviço SOAP indisponível'));
        
        client.MusicService.MusicPort.GetMusic({
          name: data.musica,
          artist: data.artista,
          link: data.link
        }, (err, result) => {
          if (err) return reject(new Error('Falha ao processar música'));
          resolve(result);
        });
      }
    );
  });
}

async function callRestService(endpoint, method = 'POST', data = null, headers = {}) {
  try {
    const url = `${REST_API_BASE}${endpoint}`.replace(/([^/])$/, '$1/');
    
    const response = await axios({
      method: method.toLowerCase(),
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      data,
      validateStatus: status => status < 500,
      maxRedirects: 0 
    });

    if (response.status >= 400) {
      const error = new Error(`Erro REST: ${response.statusText}`);
      error.response = response;
      throw error;
    }

    return response.data;
  } catch (error) {
    console.error('Erro REST:', error.message);
    if (error.response) {
      error.details = error.response.data;
    }
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Gateway rodando em http://localhost:${PORT}`);
});