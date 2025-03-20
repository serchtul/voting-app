FROM ghcr.io/tursodatabase/libsql-server:latest

RUN mkdir -p /tmp/sqlite/extensions

USER root
# To install SQLite extensions
RUN apt-get update && apt-get install -y unzip curl

# You should change this URL if you're not on arm64
RUN curl -L -o sqlean-linux.zip https://github.com/nalgeon/sqlean/releases/download/0.27.1/sqlean-linux-arm64.zip
RUN unzip sqlean-linux.zip -d /tmp/sqlite/extensions

RUN apt-get remove -y unzip curl && apt-get autoremove -y

# Ensure sqlite trusts these extensions
RUN sha256sum /tmp/sqlite/extensions/* > /tmp/sqlite/extensions/trusted.lst

EXPOSE 8080
CMD ["/bin/sqld", "-e=/tmp/sqlite/extensions"]