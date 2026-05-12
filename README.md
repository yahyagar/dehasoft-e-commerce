# DehaSoft E-Commerce

Laravel Backend / Next.js Frontend e-commerce test project.

Bu proje, DehaSoft test case gereksinimlerine uygun olarak geliştirilmiş proxy katmanlı bir e-ticaret uygulamasıdır. Frontend uygulaması Laravel API'ye doğrudan erişmez; tüm backend iletişimi Next.js API route'ları üzerinden proxy edilerek yapılır.

## İçindekiler

- [Mimari](#mimari)
- [Teknolojiler](#teknolojiler)
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Environment Değişkenleri](#environment-değişkenleri)
- [Çalıştırma](#çalıştırma)
- [Test ve Kontroller](#test-ve-kontroller)
- [API Özeti](#api-özeti)
- [Güvenlik Yaklaşımı](#güvenlik-yaklaşımı)
- [Notlar](#notlar)

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

Proje klasörleri:

```text
.
├── e-commerce-api   Laravel backend API
├── e-commerce-web   Next.js frontend ve proxy layer
└── docs             Backend/frontend geliştirme ve sunum notları
```

## Teknolojiler

Backend:

- Laravel 13
- PHP 8.3+
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

- Kullanıcı kayıt, giriş, çıkış
- JWT token üretimi
- Next.js tarafında httpOnly cookie ile token saklama
- Laravel tarafında JWT doğrulama
- Admin/customer role ayrımı

Proxy ve güvenlik:

- Laravel API için `Proxy-Secret-Key` kontrolü
- Backend URL ve proxy secret değerlerinin client tarafına sızmaması
- Admin endpointlerinde backend middleware kontrolü

Ürün ve kategori:

- Kategori listeleme
- Ürün listeleme ve detay
- Admin ürün ekleme, güncelleme, silme
- Ürün görsel upload desteği

Sepet:

- Sepete ürün ekleme
- Miktar güncelleme
- Ürün silme
- Sepeti temizleme
- Sepet toplamlarını para birimine göre görüntüleme

Sipariş:

- Sepetten sipariş oluşturma
- Teslimat bilgilerini kaydetme
- Sipariş listeleme ve detay görüntüleme
- Admin sipariş durum güncelleme
- Sipariş oluşturunca stok düşme ve sepet temizleme

Döviz kuru:

- TRY, USD, EUR desteği
- Currency API ile kur senkronizasyonu
- Ürün, sepet ve sipariş fiyatlarının seçilen para birimine göre gösterimi

## Kurulum

Projeyi klonladıktan sonra backend ve frontend ayrı ayrı kurulmalıdır.

### Backend

```bash
cd e-commerce-api
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Veritabanı hazırlandıktan sonra:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

### Frontend

```bash
cd e-commerce-web
npm install
```

## Environment Değişkenleri

README içinde gerçek secret veya API key tutulmaz. Aşağıdaki değerler local geliştirme için örnek placeholder değerlerdir.

### Backend `.env`

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

- `API_PROXY_SECRET` ve frontend `LARAVEL_PROXY_SECRET` aynı olmalıdır.
- `JWT_SECRET` manuel yazılmak yerine `php artisan jwt:secret` ile üretilmelidir.
- `CURRENCY_API_KEY` gerçek API key olmalıdır, public repo'ya yazılmamalıdır.

### Frontend `.env.local`

```env
LARAVEL_API_URL=http://127.0.0.1:8000/api
LARAVEL_PROXY_SECRET=change-me-local-proxy-secret
```

Bu dosya client bundle'a dahil edilmez; server-side Next.js API route'ları tarafından kullanılır.

## Çalıştırma

Backend:

```bash
cd e-commerce-api
php artisan serve
```

Varsayılan backend adresi:

```text
http://127.0.0.1:8000
```

Frontend:

```bash
cd e-commerce-web
npm run dev
```

Varsayılan frontend adresi:

```text
http://localhost:3000
```

## Döviz Kuru Senkronizasyonu

Currency API'den güncel kurları çekmek için:

```bash
cd e-commerce-api
php artisan exchange-rates:sync
```

Currency API free planında base currency USD olduğu için backend USD bazlı oranları TRY karşılıklarına çevirerek kaydeder.

## Test ve Kontroller

Backend test:

```bash
cd e-commerce-api
php artisan test
```

Frontend lint:

```bash
cd e-commerce-web
npm run lint
```

Frontend TypeScript kontrolü:

```bash
cd e-commerce-web
npx tsc --noEmit
```

## API Özeti

Tüm endpointler `/api` prefix'i altındadır.

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
PUT  /api/orders/{order}/status
```

Döviz:

```text
GET /api/exchange-rates
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

JWT:

- Login/register sonrası JWT üretilir.
- Frontend token'ı httpOnly cookie'de saklar.
- Korumalı Next.js proxy route'ları cookie'den token'ı okuyup Laravel'e `Authorization: Bearer TOKEN` olarak iletir.
- Laravel token doğrulamasını `auth:api` guard ile yapar.

Admin:

- Admin kontrolleri sadece frontend ile sınırlı değildir.
- Ürün yazma/silme ve sipariş status güncelleme endpointleri backend'de `admin` middleware ile korunur.

## Ürün Görsel Upload Akışı

Admin panelde ürün görseli dosya olarak yüklenir.

```text
Admin görsel seçer
  -> Next.js proxy FormData gönderir
  -> Laravel dosyayı storage/app/public/products altına kaydeder
  -> Public URL üretir
  -> products.image_url alanına yazar
  -> Frontend image_url ile görseli gösterir
```

Görsel validation:

```text
jpg, jpeg, png, webp
max 2 MB
```

`php artisan storage:link` komutu public dosya erişimi için gereklidir.

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


