FROM node:18-alpine

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN yarn && yarn --cwd /app/src/public

CMD ["yarn", "start"]
