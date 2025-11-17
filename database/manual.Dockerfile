FROM docker.io/library/postgres:18

WORKDIR /db

COPY init/ /docker-entrypoint-initdb.d/

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
COPY local.env /opt/local.env

WORKDIR /var/lib/postgresql

EXPOSE 5432

# default execution
ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "/opt/local.env"]

# cli configurable execution
CMD ["postgres"]
