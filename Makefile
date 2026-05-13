API_DIR := e-commerce-api
WEB_DIR := e-commerce-web

.PHONY: help install install-api install-web setup-env api-env api-key api-jwt-secret web-env \
	api-serve web-dev \
	test test-api test-web web-lint web-typecheck web-build \
	api-pint api-migrate api-seed api-migrate-seed api-storage-link api-db-fresh \
	exchange-rates status

help:
	@echo "DehaCommerce commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install           Install backend and frontend dependencies"
	@echo "  make setup-env         Create env files and generate Laravel/JWT keys"
	@echo "  make api-env           Create backend .env from .env.example"
	@echo "  make api-key           Generate Laravel APP_KEY"
	@echo "  make api-jwt-secret    Generate JWT_SECRET"
	@echo "  make web-env           Create frontend .env.local with local defaults"
	@echo "  make install-api       Run composer install"
	@echo "  make install-web       Run npm install"
	@echo ""
	@echo "Development:"
	@echo "  make api-serve         Start Laravel API server"
	@echo "  make web-dev           Start Next.js dev server"
	@echo ""
	@echo "Quality:"
	@echo "  make test              Run backend tests and frontend checks"
	@echo "  make test-api          Run Laravel/Pest tests"
	@echo "  make test-web          Run frontend lint and TypeScript checks"
	@echo "  make web-lint          Run frontend lint"
	@echo "  make web-typecheck     Run TypeScript check"
	@echo "  make web-build         Run production frontend build"
	@echo "  make api-pint          Format backend code with Pint"
	@echo ""
	@echo "Database:"
	@echo "  make api-migrate       Run Laravel migrations"
	@echo "  make api-seed          Run Laravel seeders"
	@echo "  make api-migrate-seed  Run migrations and seeders"
	@echo "  make api-storage-link  Create Laravel public storage link"
	@echo "  make api-db-fresh      Drop/recreate DB tables and seed"
	@echo ""
	@echo "Integrations:"
	@echo "  make exchange-rates    Sync TRY/USD/EUR exchange rates"
	@echo ""
	@echo "Git:"
	@echo "  make status            Show git status"

install: install-api install-web

install-api:
	cd $(API_DIR) && composer install

install-web:
	cd $(WEB_DIR) && npm install

setup-env: api-env api-key api-jwt-secret web-env

api-env:
	@if [ ! -f "$(API_DIR)/.env" ]; then cp "$(API_DIR)/.env.example" "$(API_DIR)/.env"; echo "Created $(API_DIR)/.env"; else echo "$(API_DIR)/.env already exists"; fi

api-key:
	cd $(API_DIR) && php artisan key:generate

api-jwt-secret:
	cd $(API_DIR) && php artisan jwt:secret

web-env:
	@if [ ! -f "$(WEB_DIR)/.env.local" ]; then printf "LARAVEL_API_URL=http://127.0.0.1:8000/api\nLARAVEL_PROXY_SECRET=change-me-local-proxy-secret\n" > "$(WEB_DIR)/.env.local"; echo "Created $(WEB_DIR)/.env.local"; else echo "$(WEB_DIR)/.env.local already exists"; fi

api-serve:
	cd $(API_DIR) && php artisan serve

web-dev:
	cd $(WEB_DIR) && npm run dev

test: test-api test-web

test-api:
	cd $(API_DIR) && php artisan test

test-web: web-lint web-typecheck

web-lint:
	cd $(WEB_DIR) && npm run lint

web-typecheck:
	cd $(WEB_DIR) && npx tsc --noEmit

web-build:
	cd $(WEB_DIR) && npm run build

api-pint:
	cd $(API_DIR) && ./vendor/bin/pint

api-migrate:
	cd $(API_DIR) && php artisan migrate

api-seed:
	cd $(API_DIR) && php artisan db:seed

api-migrate-seed:
	cd $(API_DIR) && php artisan migrate --seed

api-storage-link:
	cd $(API_DIR) && php artisan storage:link

api-db-fresh:
	cd $(API_DIR) && php artisan migrate:fresh --seed

exchange-rates:
	cd $(API_DIR) && php artisan exchange-rates:sync

status:
	git status --short
