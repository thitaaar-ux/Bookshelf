FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN npm install \
  && npm run build \
  && cp -r public .next/standalone/public \
  && mkdir -p .next/standalone/.next \
  && cp -r .next/static .next/standalone/.next/static \
  && npm prune --omit=dev

WORKDIR /app/.next/standalone
EXPOSE 3000
CMD ["node", "server.js"]
