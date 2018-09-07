FROM node:10

WORKDIR /root/server

# Create data directories if needed
RUN mkdir -p /root/.dockervol/.qtum
RUN mkdir -p /root/.dockervol/.bodhi

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production: RUN npm install --only=production
RUN npm install

# Bundle app source
COPY . .

# Expose ports for UI and API
EXPOSE 8989

# Run server
CMD [ "npm", "run", "mainnet:prod" ]
