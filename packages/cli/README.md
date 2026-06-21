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
