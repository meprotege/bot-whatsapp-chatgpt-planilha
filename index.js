const axios = require('axios');
const qrcode = require('qrcode-terminal');

const config = {
  baseURL: 'https://wppconnect-server-1-64x1.onrender.com/api',
  session: 'NERDWHATS_AMERICA',
  token: 'token123' // mesmo valor que você colocou no config.json
};

async function startSession() {
  try {
    const response = await axios.post(
      `${config.baseURL}/${config.session}/start-session`,
      {
        webhook: '',
        waitQrCode: true
      },
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const qrCode = response.data.qrcode;
    if (qrCode) {
      console.log('Escaneie o QR Code abaixo para conectar o WhatsApp:');
      qrcode.generate(qrCode, { small: true });
    } else {
      console.log('Sessão iniciada ou QR Code não retornado.');
    }
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error.response?.data || error.message);
  }
}

startSession();
