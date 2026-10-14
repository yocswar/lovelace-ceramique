FROM php:8.5-fpm-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        git \
        unzip \
        curl \
    && docker-php-ext-install -j$(nproc) pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Fichiers applicatifs dans l'image (secours si le bind mount Windows est vide)
COPY index.php /var/www/html/index.php
COPY config/ /var/www/html/config/

CMD ["php-fpm"]
