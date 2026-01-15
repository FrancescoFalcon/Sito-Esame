FROM node:latest
RUN mkdir -p /usr/src/backend
WORKDIR /usr/src/backend
RUN npm install -g nodemon
COPY ./backend/package.json /usr/src/backend
RUN npm install
COPY ./backend /usr/src/backend
EXPOSE 3000
CMD ["node", "app.js"]
