# NodeAdmin App

Aplikasi admin panel yang di-scaffold dari `@flazhost-nodeadmin/create-app`.
Runtime generik berasal dari paket [`@flazhost-nodeadmin/core`](https://www.npmjs.com/package/@flazhost-nodeadmin/core).

## Mulai

```bash
npm install
cp .env.example .env          # default: SQLite (tanpa server DB)
npm run migration:run         # buat tabel + seed admin & setting
npm run start:dev             # http://localhost:3000
```

Login default: `admin@admin.com` / `12345678` (ganti sebelum production).

## Ganti database

Edit `.env` → `DB_TYPE` (mysql | mariadb | postgres | better-sqlite3 | mssql | oracle)
dan kredensialnya. Driver mysql2 & pg sudah terpasang.

## Update runtime

```bash
npm update @flazhost-nodeadmin/core @flazhost-nodeadmin/cli
```
