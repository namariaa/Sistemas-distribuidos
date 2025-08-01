import amqplib from 'amqplib';
import axios from 'axios';
import { createClient } from 'soap';

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'music_queue';
const SOAP_URL = 'http://localhost:9000/music?wsdl';
const REST_API_BASE = 'http://127.0.0.1:8000/api/';

class MusicServices {
  static async callSoapAPI(songId) {
    return new Promise((resolve, reject) => {
      createClient(SOAP_URL, { disableCache: true }, (err, client) => {
        if (err) return reject(new Error("SOAP Service Unavailable"));
        
        client.MusicService.MusicPort.GetMusic(
          { songId },
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
    });
  }

  static async callRestAPI(songId, metadata) {
    try {
      const response = await axios.post(`${REST_API_BASE}songs`, {
        songId,
        title: metadata?.name || 'Unknown',
        artist: metadata?.artist || 'Unknown'
      });
      return response.data;
    } catch (error) {
      console.error("REST Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

class MusicWorker {
  static async start() {
    try {
      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      channel.prefetch(1); 
      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;
        const { songId } = JSON.parse(msg.content.toString());
        try {
          const soapData = await MusicServices.callSoapAPI(songId);
          const restResult = await MusicServices.callRestAPI(songId, soapData?.dados);
          console.log(`A musica foi:`, restResult);
          channel.ack(msg);
        } catch (error) {
          console.error(`Deu B.O:`, error.message);
          this.handleRetry(channel, msg);
        }
      });

    } catch (error) {
      console.error("Erro na conexão:", error);
      setTimeout(() => MusicWorker.start(), 5000);
    }
  }

  static handleRetry(channel, msg) {
    const retryHeaders = msg.properties.headers || {};
    const retryCount = retryHeaders['x-retry-count'] || 0;

    if (retryCount < 3) {
      channel.sendToQueue(
        QUEUE_NAME,
        msg.content,
        { 
          persistent: true,
          headers: { 'x-retry-count': retryCount + 1 }
        }
      );
    } else {
      console.log("Deu erro na envio da mensagem");
     
    }
    channel.ack(msg); 
  }
}
MusicWorker.start().catch(console.error);