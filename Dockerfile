FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .
RUN npx prisma generate
COPY .env .env

RUN npm run build

CMD ["npm", "run", "start:prod"]

EXPOSE 3000