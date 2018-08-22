FROM node:9

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Copy SSL certs
COPY /etc/letsencrypt/live/puti.io/privkey.pem ./certs/privkey.pem
COPY /etc/letsencrypt/live/puti.io/fullchain.pem ./certs/fullchain.pem

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . .

# Expose ports for UI and API
EXPOSE 3000 8989

# Run server
CMD [ "npm", "run", "start-test" ]
