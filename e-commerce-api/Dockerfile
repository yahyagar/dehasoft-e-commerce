FROM php:8.4-fpm-bookworm

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY . .
COPY docker/entrypoint.sh /usr/local/bin/dehacommerce-api-entrypoint.sh

RUN chmod +x /usr/local/bin/dehacommerce-api-entrypoint.sh \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["dehacommerce-api-entrypoint.sh"]
CMD ["php-fpm"]
