FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY . .

RUN npm install
RUN npm install -g prisma cross-env storybook

RUN npx prisma generate
RUN npx storybook init

EXPOSE 3000 3001 5555 6006
ENTRYPOINT ["./docker-entrypoint.sh"]