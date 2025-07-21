const http = require('http');
console.log("==== TESTE COM HTTP SERVER INICIOU ====");

const server = http.createServer((req, res) => {
  res.end("Bot Diana ativo!");
});

server.listen(21465, () => {
  console.log("Servidor HTTP ouvindo na porta 21465");
});
