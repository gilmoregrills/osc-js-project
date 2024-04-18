FROM node:18-alpine

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN yarn

CMD ["yarn", "start"]
