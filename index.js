const http = require('http');

const PORT = process.env.PORT || 3000;
console.log("==== TESTE COM HTTP SERVER INICIOU ====");

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("Bot Diana ativo!\n");
});

server.listen(PORT, () => {
  console.log(`Servidor HTTP ouvindo na porta ${PORT}`);
});
