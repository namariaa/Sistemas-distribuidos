import amqplib from 'amqplib';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_PROCESS = 'music_process';
const QUEUE_RETRIEVE = 'music_retrieve';

let channel;
async function setupRabbitMQ() {
  const conn = await amqplib.connect(RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_PROCESS, { durable: true });
  await channel.assertQueue(QUEUE_RETRIEVE, { durable: true });
}

app.post('/music', async (req, res) => {
  try {  
    const { nome, artista, link } = req.body;
    const id = Date.now().toString(); 
    await channel.sendToQueue(
      QUEUE_PROCESS,
      Buffer.from(JSON.stringify({ id, nome, artista, link })
    ));
    
    res.status(202).json({ id, status: 'processing' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enfileirar' });
  }
});
app.get('/music/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.redirect(`http://localhost:8000/api/musica/${id}/download/`);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar música' });
  }
});

setupRabbitMQ().then(() => {
  app.listen(3000, () => console.log('Gateway rodando na porta 3000'));
});