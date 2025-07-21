const http = require('http');

// Usa a porta do ambiente (Render define automaticamente), padrão 3000
const PORT = process.env.PORT || 3000;

console.log("==== TESTE COM HTTP SERVER INICIOU ====");

const server = http.createServer((req, res) => {
  res.end("Bot Diana ativo!");
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP ouvindo na porta ${PORT}`);
});
