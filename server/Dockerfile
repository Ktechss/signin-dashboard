FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "start"]
