FROM maven:3.9-eclipse-temurin-23 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/data
VOLUME /app/data
EXPOSE 8080
ENV ANTHROPIC_API_KEY=""
ENV JWT_SECRET=""
RUN addgroup --system appgroup
RUN adduser  --system --ingroup appgroup non-root
RUN chown -R non-root:appgroup /app
USER non-root
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:8080/actuator/health || exit 1
ENTRYPOINT [ "java", "-jar", "app.jar"]

