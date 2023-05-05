FROM sec4us/image-builder

LABEL maintainer="contato@sec4us.com.br"

USER root

ENV DEBIAN_FRONTEND=noninteractive
ENV LC_CTYPE=POSIX

# Starter script
COPY scripts/start.sh /root/start.sh

# Prepara Docker layer
RUN chmod +x /root/start.sh

WORKDIR /u01
ENTRYPOINT ["/root/start.sh"]
