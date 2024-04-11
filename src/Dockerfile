FROM node:18-alpine

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN yarn
RUN yarn --cwd src/public

CMD ["yarn", "start"]
