FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY prisma ./prisma
RUN cd backend && npm install
RUN cd backend && npm run prisma:generate

COPY backend ./backend

WORKDIR /app/backend
EXPOSE 4000
CMD ["npm", "start"]
