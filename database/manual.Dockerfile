FROM docker.io/library/postgres:18.1

USER postgres

ARG INIT_FILE=init/schema.sql
ENV DB_INIT_FILE="${INIT_FILE}"
COPY "${DB_INIT_FILE}" /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432

# cli configurable execution
CMD ["postgres"]
