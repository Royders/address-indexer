FROM node:8.12-slim as builder

ARG GIT_SSH_KEY="NOT SET"
ARG GIT_SSH_PUB_KEY="NOT SET"

RUN apt-get update && apt-get -y upgrade && \
    apt-get -y install nodejs git bash python make build-essential openssh-client

RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    eval "$(ssh-agent)" && \
    ssh-keyscan -p 10022 gitlab.hq.blockchain-consulting.net> /root/.ssh/known_hosts

RUN echo "$GIT_SSH_PUB_KEY" > /root/.ssh/id_rsa.pub
RUN chmod 600 /root/.ssh/id_rsa.pub
RUN chmod 644 ~/.ssh/known_hosts

WORKDIR /app

RUN mkdir /app/data

VOLUME ["/app/data"]

COPY . .

RUN npm install -g typescript
# Add ssh priv key to ssh-agent to install resources from other repositories
RUN eval $(ssh-agent -s) && \
    echo "$GIT_SSH_KEY" | tr -d '\r' | ssh-add - > /dev/null && \
    npm install


RUN rm -rf /root/.ssh/


EXPOSE 5001
EXPOSE 5002

CMD [ "npm", "start"]
