FROM node:10

# Set work dir
WORKDIR /root

# Install deps
RUN apt-get update && apt-get install -y vim

# Expose ports
ENV EXPOSED_PORTS=
EXPOSE $EXPOSED_PORTS

# Map .env build args to env
ARG NAKABASE_API_KEY
ENV NAKABASE_API_KEY=$NAKABASE_API_KEY

# Copy and install
COPY . .
RUN npm install

ENTRYPOINT ["node", "src/index.js"]
