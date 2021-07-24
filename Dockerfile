FROM node

WORKDIR /workspace

COPY . .

RUN npm install

RUN npm install pm2 -g

#fargate need 443
EXPOSE 3000

CMD ["pm2-runtime", "app.js"]



