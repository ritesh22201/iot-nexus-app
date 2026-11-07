FROM eclipse-temurin:21-jre AS java
FROM node:24-bookworm-slim
COPY --from=java /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="/opt/java/openjdk/bin:${PATH}"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
RUN npm install --global firebase-tools@15.35.0
WORKDIR /workspace
COPY firebase.json .firebaserc ./
COPY infra/firebase ./infra/firebase
# Cache the runtime as the same unprivileged user used at startup.
RUN chown -R node:node /workspace
USER node
RUN firebase setup:emulators:firestore
CMD ["firebase", "emulators:start", "--project", "demo-iot-nexus", "--config", "firebase.json", "--only", "auth,firestore"]
