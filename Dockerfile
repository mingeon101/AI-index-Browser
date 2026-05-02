# 5차 프로토타입 수정용 Dockerfile
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

# 1. 작업 디렉토리를 /app으로 고정
WORKDIR /app

# 2. 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 3. 현재 경로의 모든 파일(server.js 포함)을 /app으로 복사
COPY . .

# 4. 파일이 제대로 복사되었는지 로그 확인 (디버깅용)
RUN ls -la /app

# 5. 실행 포트 설정
EXPOSE 3000

# 6. 실행 (절대 경로로 지정하여 오류 방지)
CMD ["node", "/app/server.js"]
