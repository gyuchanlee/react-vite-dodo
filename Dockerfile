# 빌드 단계
FROM node:22-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i

COPY . .
ENV NODE_ENV=production
RUN npm run build

# 실행 단계
FROM nginx:alpine

# 빌드 단계에서 생성된 dist 폴더를 Nginx 웹 서버 디렉토리로 복사
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사 (필요한 경우)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run이 사용할 포트 노출
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
