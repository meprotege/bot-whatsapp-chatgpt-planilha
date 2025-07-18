const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot do WhatsApp está rodando!');
});

create({
  session: 'NERDWHATS_AMERICA',
  headless: true,
  browserArgs: ['--no-sandbox'],
  puppeteerOptions: {
    executablePath: 'google-chrome-stable'
  }
}).then((client) => {
  console.log('✅ Bot iniciado com sucesso');

  client.onMessage(async (message) => {
    if (message.body.toLowerCase() === 'oi') {
      await client.sendText(message.from, 'Olá! 👋 Como posso ajudar?');
    }
  });
}).catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
