#!/usr/bin/env sh
set -e

if [ ! -d vendor ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "Waiting for PostgreSQL..."
until php -r 'new PDO("pgsql:host=".getenv("DB_HOST").";port=".getenv("DB_PORT").";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));' >/dev/null 2>&1; do
    sleep 2
done

php artisan package:discover --ansi
php artisan storage:link || true
php artisan migrate --force
php artisan db:seed --class=CategorySeeder --force
php artisan db:seed --class=AdminUserSeeder --force
php artisan db:seed --class=CustomerUserSeeder --force
php artisan db:seed --class=ExchangeRateSeeder --force

cat <<'EOF'

DehaCommerce Docker test data is ready:

Admin user:
  email:    admin@dehasoft.com
  password: password123

Customer user:
  email:    test@dehasoft.com
  password: password123

Seeded exchange rates:
  TRY -> 1.000000 TRY
  USD -> 32.500000 TRY
  EUR -> 35.200000 TRY

EOF

exec "$@"
