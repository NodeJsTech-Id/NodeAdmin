# @flazhost-nodeadmin/cli

Tooling for [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) — convention checker (CI gate), migration generator, and view copier for derived apps.

## Installation

```bash
npm install -D @flazhost-nodeadmin/cli
```

## Usage

```bash
npx nodeadmin <command>
```

| Command | Purpose |
|---------|---------|
| `nodeadmin check` | Check module conventions (DI, error handling, routing, render) — used as a CI gate. Any violation → non-zero exit. |
| `nodeadmin make-migration <Name>` | Generate a TypeORM migration file from a template. |
| `nodeadmin copy-views` | Copy generic views into the app structure. |
| `nodeadmin add-ui` | Upgrade an **API-only** install to **Full (UI + REST API)**. Downloads the UI layer (public assets, layouts, `home`/`components`/`media` modules, web routes/controllers/views, UI tests), merges UI deps & scripts into `package.json`, sets `APP_MODE=full` in `.env`, then verifies (`install` → `check` → `tsc` → `test`). Idempotent — running it on a Full install is a no-op. |

### `add-ui` — upgrade API-only → Full

A NodeAdmin app scaffolded with `--api` ships only the REST API. To add the admin UI later, run from the app root:

```bash
npx nodeadmin add-ui
```

This is **purely additive**: the API-only and Full variants share byte-identical source for all shared files (the variant is selected at runtime via `APP_MODE`), so the command only copies UI files that are absent and never overwrites your edits. If a shared file was modified locally and differs from the template, the template version is written alongside as `*.new` for manual merge (never overwritten silently). The two stub API tests (`access.user`, `auth`) are replaced with their full web+api versions.

> Dev/test: set `NODEADMIN_TEMPLATE_DIR=/path/to/template` to copy from a local `template/` directory instead of downloading from GitHub.

Example in a derived app's `package.json`:

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

## License

MIT
