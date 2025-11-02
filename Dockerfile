FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache nodejs npm

COPY package*.json ./
RUN npm ci --omit=dev

RUN npm install -g @nestjs/cli

COPY . .
RUN npm run build

CMD ["node", "dist/src/main"]