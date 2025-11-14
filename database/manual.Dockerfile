FROM docker.io/library/postgres:18

COPY init/ /docker-entrypoint-initdb.d/

WORKDIR /var/lib/postgresql

EXPOSE 5432

# cli configurable execution
CMD ["postgres"]
