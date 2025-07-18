import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = 'https://wppconnect-server-1-64x1.onrender.com';
const SESSION_NAME = 'NERDWHATS_AMERICA';
const TOKEN = 'token123';

async function getQRCode() {
  try {
    // 1. Iniciar a sessão
    await axios.post(
      `${SERVER_URL}/api/${SESSION_NAME}/start-session`,
      { webhook: '', waitQrCode: true },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✅ Sessão iniciada com sucesso.');

    // 2. Obter o QR Code
    const response = await axios.get(
      `${SERVER_URL}/api/${SESSION_NAME}/qrcode-session`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

    if (response.data.qrcode) {
      console.log('📲 Aponte a câmera do WhatsApp para este QR Code:\n');
      console.log(response.data.qrcode);
    } else {
      console.log('⚠️ QR Code não encontrado. Verifique se a sessão está ativa.');
    }
  } catch (error) {
    console.error('❌ Erro ao obter QR Code:', error.response?.data || error.message);
  }
}

getQRCode();
