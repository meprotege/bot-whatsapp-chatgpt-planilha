import express from 'express';
import { create } from '@wppconnect-team/wppconnect';

const app = express();
const PORT = process.env.PORT || 3000;

// Rota para verificação no Render
app.get('/', (req, res) => {
  res.send('Bot do WhatsApp está rodando!');
});

// Inicializa o bot WPPConnect
create({
  session: 'NERDWHATS_AMERICA',
  headless: true,
  browserArgs: ['--no-sandbox'],
  puppeteerOptions: {
    executablePath: 'google-chrome-stable'
  }
})
.then((client) => {
  console.log('✅ Bot iniciado com sucesso');

  client.onMessage(async (message) => {
    if (message.body.toLowerCase() === 'oi') {
      await client.sendText(message.from, 'Olá! 👋 Como posso ajudar?');
    }
  });
})
.catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
