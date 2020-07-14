FROM node:latest
RUN mkdir /opt/cross-species-web
COPY ./ /opt/cross-species-web/
WORKDIR /opt/cross-species-web
RUN yarn install
EXPOSE 8081
CMD npm run dev