FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Copy shared types
COPY ../shared ./shared

EXPOSE 3001

CMD ["npm", "run", "dev"]
