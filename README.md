# DehaCommerce

Laravel Backend / Next.js Frontend e-commerce test project.

DehaCommerce, DehaSoft test case gereksinimlerine uygun olarak geliştirilmiş proxy katmanlı bir e-ticaret uygulamasıdır. Frontend uygulaması Laravel API'ye doğrudan erişmez; tüm backend iletişimi Next.js API route'ları üzerinden proxy edilerek yapılır.

## İçindekiler

- [Mimari](#mimari)
- [Teknolojiler](#teknolojiler)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Environment Ayarları](#environment-ayarları)
- [Veritabanı Hazırlığı](#veritabanı-hazırlığı)
- [Çalıştırma](#çalıştırma)
- [Makefile Komutları](#makefile-komutları)
- [Test ve Kalite Kontrolleri](#test-ve-kalite-kontrolleri)
- [Döviz Kuru Senkronizasyonu](#döviz-kuru-senkronizasyonu)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [API Özeti](#api-özeti)
- [API Response Formatı](#api-response-formatı)
- [Güvenlik Yaklaşımı](#güvenlik-yaklaşımı)
- [Rol Yetkileri](#rol-yetkileri)
- [Proje Yapısı](#proje-yapısı)

## Mimari

```text
Browser
  -> Next.js Frontend
  -> Next.js API Proxy Layer
  -> Laravel Backend API
  -> PostgreSQL
```

Kritik mimari kural:

```text
Frontend Laravel backend'e doğrudan istek atmaz.
Tüm backend istekleri Next.js proxy katmanı üzerinden yapılır.
```

Bu nedenle Postman collection da doğrudan Laravel endpointlerini değil, Next.js proxy endpointlerini hedefler. `Proxy-Secret-Key`, Laravel URL ve JWT aktarımı client tarafına açılmaz; Next.js API route'ları bu bilgileri server-side olarak Laravel'e iletir.

## Teknolojiler

Backend:

- Laravel 13
- PHP 8.4+
- PostgreSQL
- tymon/jwt-auth
- Pest

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Özellikler

Auth:

- Kullanıcı kayıt, giriş ve çıkış
- JWT token üretimi
- Next.js tarafında httpOnly cookie ile token saklama
- Laravel tarafında `auth:api` ile JWT doğrulama
- `admin` ve `customer` role ayrımı

Proxy ve güvenlik:

- Laravel API için `Proxy-Secret-Key` kontrolü
- Backend URL ve proxy secret değerlerinin client tarafına sızmaması
- Admin endpointlerinde backend middleware kontrolü
- Customer kullanıcıların yalnızca kendi sepet ve sipariş verilerine erişebilmesi

Ürün ve kategori:

- Kategori listeleme
- Ürün listeleme ve ürün detayı
- Aktif/pasif ürün yönetimi
- Admin ürün ekleme, güncelleme ve silme
- Ürün görsel upload desteği

Sepet:

- Sepete ürün ekleme
- Miktar artırma/azaltma
- Ürün silme
- Sepeti temizleme
- Sepet toplamlarını seçilen para birimine göre görüntüleme

Sipariş:

- Sepetten sipariş oluşturma
- Teslimat bilgilerini kaydetme
- Sipariş listeleme ve detay görüntüleme
- Admin sipariş durum güncelleme
- Sipariş oluşturunca stok düşme ve sepet temizleme

Döviz kuru:

- TRY, USD, EUR desteği
- Currency API ile kur senkronizasyonu
- Ürün, sepet, checkout ve sipariş fiyatlarının seçilen para birimine göre gösterimi

## Kurulum

Ön gereksinimler:

- PHP 8.4+
- Composer
- Node.js ve npm
- PostgreSQL
- `make` komutu

Docker ile çalıştırmak isterseniz local PHP, Composer, Node.js ve PostgreSQL kurulumuna ihtiyaç duymadan Docker Desktop yeterlidir.

### Docker ile Test Ortamını Çalıştırma

Projeyi hızlıca test etmek için önerilen en pratik yol Docker kullanmaktır. Docker kurulumu, local makinede ayrı ayrı PHP, Composer, Node.js ve PostgreSQL hazırlamadan çalışır.

Kök dizinde:

```bash
make docker-up
```

Bu komut şu servisleri başlatır:

```text
postgres  -> PostgreSQL database
api       -> Laravel PHP-FPM uygulaması
nginx     -> Laravel API HTTP girişi
web       -> Next.js frontend ve proxy layer
```

Docker ortamında adresler:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
Postgres: localhost:5433
```

Container içi proxy akışı:

```text
Browser
  -> Next.js web container
  -> http://nginx/api
  -> Laravel API
  -> PostgreSQL
```

Docker ortamı bir test/demo ortamı oluşturmak için hazırlanmıştır. API container başlangıcında migration'lar çalışır ve temel test datası otomatik oluşturulur. Başlangıç sırasında terminalde şu bilgiler gösterilir:

```text
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
```

Bu bilgilerle uygulama doğrudan test edilebilir. Kur bilgileri Docker test ortamında Currency API'den değil, bilinçli olarak seeder üzerinden gelir. Böylece projeyi çeken kişi API key girmeden aynı test ortamını ayağa kaldırabilir.

Ürün datası otomatik oluşturulmaz; admin panelden ürün eklenerek ürün, sepet, checkout ve sipariş akışı test edilebilir.

Docker servislerini durdurmak için:

```bash
make docker-down
```

Docker test ortamı varsayılan olarak seeder kurlarıyla açılır. Gerçek Currency API verileriyle kur senkronizasyonunu test etmek isterseniz API key'i Docker stack başlatılırken verilmelidir:

```bash
CURRENCY_API_KEY=your_currency_api_key make docker-up
```

Stack bu şekilde başlatıldığında uygulama yine seeder kurlarıyla açılır, ancak API container içinde `CURRENCY_API_KEY` bulunduğu için gerçek sync komutu sonradan çalıştırılabilir:

```bash
docker compose exec api php artisan exchange-rates:sync
```

Bu komut Currency API'den güncel TRY/USD/EUR oranlarını çeker ve `exchange_rates` tablosunu günceller. Eğer Docker stack `CURRENCY_API_KEY` verilmeden başlatılmışsa bu komut `Currency API key is not configured` hatası döner.

### Docker Kullanmadan Kurulum

Projeyi klonladıktan sonra bağımlılıkları kökten kurabilirsiniz:

```bash
make install
```

Manuel kurulum tercih edilirse:

```bash
cd e-commerce-api
composer install

cd ../e-commerce-web
npm install
```

### Backend `.env`

Kök dizinden:

```bash
make setup-env
```

Bu komut backend `.env` dosyasını oluşturur, Laravel `APP_KEY` ve `JWT_SECRET` üretir, frontend için de `.env.local` dosyasını hazırlar.

Sadece backend env işlemleri için:

```bash
make api-env
make api-key
make api-jwt-secret
```

Backend `.env` içinde özellikle şu değerleri ayarlayın:

```env
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dehasoft
DB_USERNAME=postgres
DB_PASSWORD=your_db_password

API_PROXY_SECRET=change-me-local-proxy-secret
JWT_SECRET=generated-by-php-artisan-jwt-secret
JWT_TTL=120

CURRENCY_API_URL=https://currencyapi.net/api/v2/rates
CURRENCY_API_KEY=your_currency_api_key
CURRENCY_API_BASE=USD
CURRENCY_API_TIMEOUT=10
```

Önemli:

- `JWT_SECRET` manuel yazılmak yerine `php artisan jwt:secret` ile üretilmelidir.
- `CURRENCY_API_KEY` gerçek Currency API key değeridir ve public repoya yazılmamalıdır.
- `API_PROXY_SECRET` ve frontend `LARAVEL_PROXY_SECRET` aynı olmalıdır.

### Frontend `.env.local`

`make setup-env` veya `make web-env` bu dosyayı local default değerlerle oluşturur:

```bash
make web-env
```

İçeriği:

```env
LARAVEL_API_URL=http://127.0.0.1:8000/api
LARAVEL_PROXY_SECRET=change-me-local-proxy-secret
```

`LARAVEL_API_URL` local geliştirme için verilen varsayılan backend adresidir. Backend'i farklı host/port ile çalıştırırsanız bu değeri ona göre güncelleyin. `LARAVEL_PROXY_SECRET`, backend `API_PROXY_SECRET` ile aynı olmalıdır.

Bu değerler client bundle'a dahil edilmez; Next.js API route'ları tarafından server-side kullanılır.

## Veritabanı Hazırlığı

PostgreSQL tarafında `.env` içinde verdiğiniz database oluşturulduktan sonra:

```bash
make api-migrate-seed
make api-storage-link
```

Manuel karşılığı:

```bash
cd e-commerce-api
php artisan migrate --seed
php artisan storage:link
```

`storage:link`, admin panelden yüklenen ürün görsellerinin public URL ile görüntülenebilmesi için gereklidir.

## Çalıştırma

Backend:

```bash
make api-serve
```

Varsayılan backend adresi:

```text
http://127.0.0.1:8000
```

Frontend:

```bash
make web-dev
```

Varsayılan frontend adresi:

```text
http://localhost:3000
```

Uygulama akışı:

```text
http://localhost:3000
```

Admin panel:

```text
http://localhost:3000/admin
```

## Makefile Komutları

Kök dizindeki `Makefile`, sık kullanılan backend/frontend komutlarını tek yerden çalıştırmak için eklenmiştir.

Setup:

```bash
make install
make setup-env
make api-env
make api-key
make api-jwt-secret
make web-env
make install-api
make install-web
```

Development:

```bash
make api-serve
make web-dev
make docker-build
make docker-up
make docker-down
make docker-logs
make docker-ps
```

Database:

```bash
make api-migrate
make api-seed
make api-migrate-seed
make api-storage-link
```

Entegrasyon:

```bash
make exchange-rates
```

Kalite:

```bash
make test
make test-api
make test-web
make web-lint
make web-typecheck
make web-build
make api-pint
```

## Test ve Kalite Kontrolleri

Tüm ana kontroller:

```bash
make test
```

Backend feature testleri:

```bash
make test-api
```

Test kapsamı:

- Proxy secret kontrolü
- Auth register/login ve role dönüşleri
- Customer kullanıcının admin endpointlerine erişememesi
- Admin ürün ekleme/güncelleme/silme
- Pasif ürünlerin aktif ürün listesinde görünmemesi
- Sepete ürün ekleme ve stok üstü miktarın engellenmesi
- Kullanıcıların başka kullanıcı sepet item'larını değiştirememesi
- Boş sepetten sipariş oluşturulamaması
- Sipariş oluşunca stok düşmesi ve sepetin temizlenmesi
- Customer kullanıcının yalnızca kendi siparişlerini görebilmesi
- Admin kullanıcının sipariş listeleme ve status güncellemesi

Frontend lint ve TypeScript kontrolü:

```bash
make test-web
```

Production build:

```bash
make web-build
```

Backend format:

```bash
make api-pint
```

## Döviz Kuru Senkronizasyonu

Currency API'den güncel kurları çekmek için:

```bash
make exchange-rates
```

Manuel karşılığı:

```bash
cd e-commerce-api
php artisan exchange-rates:sync
```

Currency API free planında base currency USD olduğu için backend USD bazlı oranları TRY karşılıklarına çevirerek kaydeder.

## API Dokümantasyonu

Postman collection:

```text
docs/postman/dehacommerce-next-proxy.postman_collection.json
```

Postman kullanımı:

1. Backend ve frontend sunucularını çalıştırın.
2. Postman'de collection dosyasını import edin.
3. `baseUrl` değerinin `http://localhost:3000` olduğundan emin olun.
4. Customer işlemleri için önce `POST customer login` isteğini çalıştırın.
5. Admin işlemleri için önce `POST admin login` isteğini çalıştırın.

Collection bilinçli olarak Next.js proxy endpointlerini test eder; Laravel API'ye doğrudan istek atmaz. Bu sayede proxy zorunluluğu, backend izolasyonu, httpOnly cookie ile JWT saklama ve server-side secret yönetimi doğrulanır.

## API Özeti

Tarayıcı ve Postman tarafında hedeflenen endpointler Next.js proxy endpointleridir.

Auth:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Kategori ve ürün:

```text
GET    /api/categories
GET    /api/products
GET    /api/products/{product}
POST   /api/products
PUT    /api/products/{product}
DELETE /api/products/{product}
```

Sepet:

```text
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{cartItem}
DELETE /api/cart/items/{cartItem}
DELETE /api/cart
```

Sipariş:

```text
GET  /api/orders
POST /api/orders
GET  /api/orders/{order}
```

Admin sipariş:

```text
GET /api/admin/orders
GET /api/admin/orders/{order}
PUT /api/admin/orders/{order}/status
```

Health:

```text
GET /api/health
```

## API Response Formatı

Başarılı response:

```json
{
  "data": {},
  "message": "Success"
}
```

Hata response:

```json
{
  "data": {},
  "message": "Error message"
}
```

Validation response:

```json
{
  "data": {
    "errors": {}
  },
  "message": "Validation failed"
}
```

## Güvenlik Yaklaşımı

Proxy secret:

- Laravel'e giden protected isteklerde `Proxy-Secret-Key` header'ı kontrol edilir.
- Bu değer `.env` içinde tutulur.
- Client tarafına açık değildir.
- Next.js proxy route'ları Laravel'e giderken bu header'ı server-side ekler.

JWT:

- Login/register sonrası JWT üretilir.
- Frontend token'ı httpOnly cookie'de saklar.
- Korumalı Next.js proxy route'ları cookie'den token'ı okuyup Laravel'e `Authorization: Bearer TOKEN` olarak iletir.
- Laravel token doğrulamasını `auth:api` guard ile yapar.

Admin:

- Admin kontrolleri sadece frontend ile sınırlı değildir.
- Ürün yazma/silme ve sipariş status güncelleme endpointleri backend'de `admin` middleware ile korunur.
- Customer kullanıcılar admin endpointlerinden `403 Forbidden` alır.

CORS ve backend exposure:

- Client Laravel URL'sini doğrudan kullanmaz.
- Backend internal secret ve token aktarımı browser JavaScript tarafına açılmaz.

## Rol Yetkileri

Admin:

- Ürün ekler
- Ürün günceller
- Ürün siler
- Tüm siparişleri görür
- Sipariş durumunu günceller

Customer:

- Ürünleri görür
- Sepet işlemleri yapar
- Sipariş oluşturur
- Sadece kendi siparişlerini görür

## Proje Yapısı

```text
.
├── README.md
├── Makefile
├── docs
│    └── postman
│       └── dehacommerce-next-proxy.postman_collection.json
├── e-commerce-api
│   ├── app
│   ├── database
│   ├── routes
│   └── tests
└── e-commerce-web
    ├── src/app
    ├── src/components
    ├── src/lib
    └── src/types
```
