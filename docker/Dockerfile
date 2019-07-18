FROM node:10

# Install deps
RUN apt-get update && apt-get install -y vim

# Expose ports
ENV EXPOSED_PORTS=
EXPOSE $EXPOSED_PORTS

# Copy and install
COPY . .
RUN npm install

ENTRYPOINT ["node", "src/index.js"]
