import express from 'express';
import amqplib from 'amqplib';

const app = express();
app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'music_queue';

async function enqueueSong(songId) {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify({ songId })),
    { persistent: true }
  );
  
  setTimeout(() => connection.close(), 500);
}

app.post('/play', async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({ error: "songId é obrigatório" });
    }

    await enqueueSong(songId);
    
    res.status(202).json({ 
      status: "enqueued",
      songId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro no gateway:", error);
    res.status(500).json({ error: "Falha no enfileiramento" });
  }
});

app.listen(3000, () => {
  console.log("Gateway rodando na porta 3000");
});