# @flazhost-nodeadmin/cli

Tooling [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) — convention checker (CI gate), generator migration, dan copy views untuk app turunan.

## Instalasi

```bash
npm install -D @flazhost-nodeadmin/cli
```

## Penggunaan

```bash
npx nodeadmin <command>
```

| Command | Fungsi |
|---------|--------|
| `nodeadmin check` | Cek konvensi modul (DI, error handling, route, render) — dipakai sebagai CI gate. Penyimpangan → exit non-zero. |
| `nodeadmin make-migration <Nama>` | Generate file migration TypeORM dari template. |
| `nodeadmin copy-views` | Salin views generik ke struktur app. |

Contoh di `package.json` app turunan:

```json
{
  "scripts": {
    "lint:conventions": "nodeadmin check"
  }
}
```

```bash
npm run lint:conventions
```

## Lisensi

MIT
