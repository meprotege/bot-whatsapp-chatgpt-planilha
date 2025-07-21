FROM node:20

# Instala dependências necessárias
RUN apt-get update && apt-get install -y wget gnupg
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install -y ./google-chrome-stable_current_amd64.deb

# Cria diretório de trabalho
WORKDIR /usr/src/app

# Copia todos os arquivos do projeto
COPY . .

# Instala dependências do Node.js
RUN npm install

# Expõe a porta 3000, que é a padrão para Web Service em cloud
EXPOSE 3000

# Comando padrão de inicialização
CMD [ "node", "index.js" ]
