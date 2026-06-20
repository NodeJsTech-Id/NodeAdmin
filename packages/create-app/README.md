# @flazhost-nodeadmin/create-app

Scaffolder untuk membuat aplikasi [NodeAdmin](https://github.com/FlazHost-Com/NodeAdmin) lengkap dalam satu perintah.

## Penggunaan

```bash
npm create @flazhost-nodeadmin/app myapp
```

(atau `npm init @flazhost-nodeadmin/app myapp`, `yarn create @flazhost-nodeadmin/app myapp`, `pnpm create @flazhost-nodeadmin/app myapp`)

Tanpa argumen nama → akan ditanya interaktif.

## Yang dihasilkan

Aplikasi admin panel utuh (TypeScript + Express + TypeORM): auth, RBAC (user/role/permission), profile, setting + template switcher, views EJS, migrations + seed admin. Runtime generik berasal dari paket [`@flazhost-nodeadmin/core`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) + [`@flazhost-nodeadmin/cli`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) (ditarik dari npm), sehingga update runtime cukup `npm update`.

Default database: **SQLite** (zero-setup) — ganti via `.env`.

## Setelah scaffold

```bash
cd myapp
npm install
cp .env.example .env
npm run migration:run     # tabel + seed admin & setting
npm run start:dev         # http://localhost:3000
```

Login default: `admin@admin.com` / `12345678`.

## Lisensi

ISC
