console.log("==== BOT DIANA INICIOU! ====");

try {
  const fs = require('fs');
  const { google } = require('googleapis');
  const { create } = require('@wppconnect-team/wppconnect');
  const OpenAI = require('openai');
  require('dotenv').config();
  const config = require('./config.json');

  console.log('🚀 Iniciando bot Diana...');

  const enviados = fs.existsSync('./enviados.json')
    ? JSON.parse(fs.readFileSync('./enviados.json'))
    : [];

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const SHEET_ENTRADA = config.planilhaEntradaId || '1M8Q0fcM6Is7LBYH7Zg-R5nPqgsrE6_dOkE5wK7VwlX4';
  const SHEET_SAIDA = config.planilhaRetornoId || '1VRgKWycTAsOD5worfR6VejpMlMTgFbLAe8pfAs81gDU';

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  function salvarEnviado(tel) {
    enviados.push(tel);
    fs.writeFileSync('./enviados.json', JSON.stringify(enviados, null, 2));
  }

  async function gerarMensagem(nome, origem, textoUsuario = '') {
    const prompt = fs.readFileSync('./prompts/ia-agente.txt', 'utf-8');
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: `Contato: ${nome}. Origem: ${origem}. Mensagem: ${textoUsuario}` }
    ];
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
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
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-zygote',
      '--disable-gpu',
      '--single-process',
      '--disable-software-rasterizer'
    ],
    puppeteerOptions: { executablePath: 'google-chrome-stable' },
  }).then((client) => {
    console.log('🤖 Bot Diana conectado com sucesso!');
    setInterval(() => iniciarEnvio(client), 60 * 1000); // Executa a cada 1 minuto

    // ====== LISTENER A - LOGS DETALHADOS + IA ======
    client.onMessage(async (message) => {
      if (message.isGroupMsg) return;

      console.log('📩 Mensagem recebida:', message.body, '| de:', message.from);

      const numero = message.from.split('@')[0];
      const texto = message.body || '';

      let nome = 'contato';
      let origem = 'lead';

      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ENTRADA,
          range: 'A2:L',
        });
        const linhas = res.data.values || [];
        const lead = linhas.find(linha => (linha[0] || '').replace(/\D/g, '') === numero);
        if (lead) {
          nome = lead[5] || 'contato';
          origem = lead[11] || 'lead';
        }
      } catch (e) {
        console.log('❗ Erro ao buscar lead na planilha:', e);
      }

      try {
        console.log('🧠 Enviando mensagem para IA:', texto);
        const resposta = await gerarMensagem(nome, origem, texto);
        console.log('🤖 Resposta IA:', resposta);

        await client.sendText(message.from, resposta);
        await registrarNaSaida(nome, numero, resposta);

        console.log(`✅ Resposta enviada para ${nome} (${numero}): ${texto}`);
      } catch (err) {
        console.error('❗ Erro ao gerar/responder mensagem:', err);
      }
    });

    // ====== LISTENER B - TESTE COM RESPOSTA FIXA ======
    // DESCOMENTE PARA TESTAR RESPOSTA FIXA
    /*
    client.onMessage(async (message) => {
      if (message.isGroupMsg) return;

      console.log('📩 Mensagem recebida:', message.body, '| de:', message.from);

      const resposta = "Recebi sua mensagem!";

      try {
        await client.sendText(message.from, resposta);
        console.log(`✅ Resposta enviada para ${message.from}`);
      } catch (err) {
        console.error('❗ Erro ao responder mensagem:', err);
      }
    });
    */
  });

  // === KEEP-ALIVE HTTP SERVER para Render ===
  const http = require('http');
  const PORT = process.env.PORT || 3000;
  http.createServer((req, res) => {
    res.end("Bot Diana rodando!");
  }).listen(PORT, () => {
    console.log(`Servidor HTTP ouvindo na porta ${PORT} (dummy keep-alive para Render)`);
  });

} catch (err) {
  console.error('Erro inesperado ao iniciar o BOT DIANA:', err);
}
