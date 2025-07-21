const fs = require('fs');
const { google } = require('googleapis');
const { create } = require('@wppconnect-team/wppconnect');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const config = require('./config.json');

console.log('🚀 Iniciando bot Diana...');

const enviados = fs.existsSync('./enviados.json')
  ? JSON.parse(fs.readFileSync('./enviados.json'))
  : [];

const auth = new google.auth.GoogleAuth({
  credentials: require('./credenciais-google.json'), // subir manualmente no Render depois
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ENTRADA = '1M8Q0fcM6Is7LBYH7Zg-R5nPqgsrE6_dOkE5wK7VwlX4';
const SHEET_SAIDA = '1VRgKWycTAsOD5worfR6VejpMlMTgFbLAe8pfAs81gDU';

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_KEY,
}));

function salvarEnviado(tel) {
  enviados.push(tel);
  fs.writeFileSync('./enviados.json', JSON.stringify(enviados, null, 2));
}

async function gerarMensagem(nome, origem) {
  const prompt = fs.readFileSync('./prompts/ia-agente.txt', 'utf-8');
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: `Contato: ${nome}. Origem: ${origem}` },
    ],
    temperature: 0.7,
  });
  return response.data.choices[0].message.content.trim();
}

async function lerPlanilha() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ENTRADA,
    range: 'A2:L',
  });

  const linhas = res.data.values || [];
  return linhas.filter(([tel, entrada, resposta]) => {
    if (!tel || enviados.includes(tel)) return false;
    if (!resposta) return false;
    const r = resposta.toLowerCase();
    return r.includes('sim') || r.includes('ok') || r.includes('claro');
  });
}

async function registrarNaSaida(nome, telefone, mensagem) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_SAIDA,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[new Date().toISOString(), nome, telefone, mensagem]],
    },
  });
}

async function iniciarEnvio(client) {
  const contatos = await lerPlanilha();
  for (const linha of contatos) {
    const [tel, , , , , nome, , , cidade, estado, cep, origem] = linha;
    const numero = tel.replace(/\D/g, '');
    const mensagem = await gerarMensagem(nome || 'contato', origem || 'lead');
    await client.sendText(`${numero}@c.us`, mensagem);
    salvarEnviado(tel);
    await registrarNaSaida(nome, tel, mensagem);
    console.log(`✅ Mensagem enviada para ${nome} - ${numero}`);
  }
}

create({
  session: process.env.SESSION_NAME || 'NERDWHATS_AMERICA',
  headless: true,
  browserArgs: ['--no-sandbox'],
  puppeteerOptions: { executablePath: 'google-chrome-stable' },
}).then((client) => {
  console.log('🤖 Bot Diana conectado com sucesso!');
  setInterval(() => iniciarEnvio(client), 60 * 1000); // Executa a cada 1 minuto
});
