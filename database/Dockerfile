FROM docker.io/library/postgres:18

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN apt-get update && apt-get install -y dos2unix \
    && dos2unix /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

COPY init/ /docker-entrypoint-initdb.d/

WORKDIR /var/lib/postgresql

EXPOSE 5432

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["postgres"]
