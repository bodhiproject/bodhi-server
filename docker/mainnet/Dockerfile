FROM node:10

EXPOSE 8888

WORKDIR /root/bodhi-server

COPY . .

RUN npm install

# Run server
CMD ["npm", "start"]
