const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
const config = require('./config.json'); // ✅ Corrigido
const app = express();

app.use(express.json());

create({
  session: 'NERDWHATS_AMERICA',
  catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
    console.log('QR Code gerado:');
    console.log(asciiQR);
  },
  statusFind: (statusSession, session) => {
    console.log(`Status da sessão ${session}: ${statusSession}`);
  },
  headless: true,
  devtools: false,
  useChrome: true,
  debug: false,
  tokenStore: 'file',
  autoClose: false,
  folderNameToken: './tokens',
  disableWelcome: true,
  port: config.port
}).then((client) => start(client));

function start(client) {
  app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).send({ error: 'Parâmetros ausentes' });
    }

    try {
      await client.sendText(`${phone}@c.us`, message);
      return res.status(200).send({ success: true });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      return res.status(500).send({ error: 'Erro ao enviar mensagem' });
    }
  });

  app.listen(config.port, config.host, () => {
    console.log(`Servidor rodando em http://${config.host}:${config.port}`);
  });
}
