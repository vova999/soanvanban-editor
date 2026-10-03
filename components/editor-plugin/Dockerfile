FROM node:24.9.0-bookworm-slim
WORKDIR /plugin
COPY --chown=node:node package.json server.js LICENSE ./
COPY --chown=node:node assets ./assets
USER node
ENV HOST=0.0.0.0 PORT=3102
EXPOSE 3102
CMD ["node", "server.js"]
