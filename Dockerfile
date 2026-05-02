FROM mcr.microsoft.com/playwright:v1.58.0-jammy

WORKDIR /app

# 한글 폰트 설치 (브라우저 화면 캡처 시 깨짐 방지)
RUN apt-get update && apt-get install -y fonts-nanum

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]

