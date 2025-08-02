import amqplib from 'amqplib';
import axios from 'axios';
import { createClient } from 'soap';

const RABBITMQ_URL = 'amqp://localhost';
const SOAP_URL = 'http://localhost:9000/music?wsdl';
const REST_API = 'http://localhost:8000/api'; 

class MusicWorker {
  static async start() {
    const conn = await amqplib.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
  
    await channel.assertQueue('music_process', { durable: true });
    await channel.assertQueue('music_retrieve', { durable: true });
    channel.prefetch(1);
    channel.consume('music_process', async (msg) => {
      if (!msg) return;
      
      const { id, nome, artista, link } = JSON.parse(msg.content.toString());
      
      try {
        await this.storeInSoap(id, nome, artista, link);
        await this.sendToRestApi(nome, artista, link);
        
        console.log(`Música ${id} processada com sucesso`);
        channel.ack(msg);
      } catch (error) {
        console.error(`Erro no processamento: ${error.message}`);
        this.handleRetry(channel, msg);
      }
    });
  
    channel.consume('music_retrieve', async (msg) => {
      if (!msg) return;
      
      try {
        const { id } = JSON.parse(msg.content.toString());
        const musicData = await this.downloadFromRest(id);
        
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(musicData)),
          { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      } catch (error) {
        console.error(`Erro ao recuperar música: ${error.message}`);
        channel.nack(msg, false, false);
      }
    });
  }
  static async storeInSoap(id, nome, artista, link) {
    return new Promise((resolve, reject) => {
      createClient(SOAP_URL, (err, client) => {
        if (err) return reject(new Error(`Erro SOAP: ${err.message}`));
        
        client.StoreMusic({ id, nome, artista, link }, (err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    });
  }

  static async sendToRestApi(nome, artista, link) {
    try {
      const response = await axios.post(`${REST_API}/musica/`, {
        "nome" : nome,
        "autor": artista,
        "link" : link
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 
      });
      
      if (!response.data.id) {
        throw new Error('Resposta inválida da API REST');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Falha ao enviar para REST: ${error.response?.data || error.message}`);
    }
  }
  static async downloadFromRest(id) {
  try {
    const response = await axios.get(`http://localhost:8000/api/musica/${id}/download/`, {
      responseType: 'stream',
      headers: {
        'Accept': 'audio/mp4',
        'Content-Type': 'application/json'
      },
      timeout: 15000 
    });
    
    return {
      stream: response.data,
      headers: {
        contentType: response.headers['content-type'],
        contentDisposition: response.headers['content-disposition'],
        nomeMusica: response.headers['nome_musica'],
        nomeAutor: response.headers['nome_autor']
      }
    };
  } catch (error) {
    throw new Error(`Falha no download: ${error.response?.statusText || error.message}`);
  }
}


  static handleRetry(channel, msg) {
    const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
    
    if (retryCount < 3) {
      channel.sendToQueue(
        'music_process',
        msg.content,
        { 
          persistent: true,
          headers: { 'x-retry-count': retryCount + 1 }
        }
      );
    } else {
      console.log('Máximo de tentativas alcançado');
      channel.sendToQueue('music_failed', msg.content);
    }
    channel.ack(msg);
  }
}

MusicWorker.start().catch(console.error);