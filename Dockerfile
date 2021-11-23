# Install dependencies only when needed
FROM node:16-alpine3.12

COPY "package.json" "."

RUN ["apk", "--no-cache", "add", "curl"]
RUN ["npm", "install", "-g", "npm@8.1.4"]
RUN ["npm", "install"]

RUN ["pwd"]
RUN ["ls", "-laF"]
# RUN ["cp", "package-lock.json", "node_modules", "/root/qify"]

WORKDIR qify


CMD ./start.sh
