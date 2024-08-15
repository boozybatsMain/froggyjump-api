FROM --platform=linux/amd64 node:lts-alpine

WORKDIR /app

COPY . .

RUN yarn install && yarn build

CMD [ "yarn", "start" ]