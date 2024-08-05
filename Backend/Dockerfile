FROM node:18-alpine
WORKDIR /client
COPY package.json .
RUN npm install
COPY . .
EXPOSE 6363
CMD ["npm", "start"]