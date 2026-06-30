# Maintenance Workflow

> Panduan internal untuk **maintainer repo** — cara publish npm, update app, library, dan menjaga rantai propagasi ke downstream repos.

---

## Publishing ke npm

**Publishing sepenuhnya otomatis via GitHub Actions — jangan jalankan `npm publish` manual.**
Repo ini (`NodeJsTech-Id/NodeAdmin`) mem-mirror snapshot bersih ke repo rilis publik (`FlazHost-Com/NodeAdmin`), yang menjadi sumber tunggal untuk paket npm dan template giget `create-app`.

### Pipeline (gated)

```
push main → CI (test) → ✅ → mirror → FlazHost-Com → (on package tag) release.yml → npm
```

- **`mirror.yml`** — setelah CI lolos, rebuild `template/` + snapshot bersih, push ke FlazHost-Com, dan forward tag (`template-v*`, `@flazhost-nodeadmin/*@*`) via `MIRROR_TOKEN` PAT.
- **`release.yml`** — berjalan di FlazHost-Com saat tag `@flazhost-nodeadmin/*@*` tiba; menjalankan `npx changeset publish` dengan `NPM_TOKEN`.

### Dua jenis tag

| Tag | Efek |
|-----|------|
| `template-v<x.y.z>` | Snapshot app baru untuk giget. `create-app` merujuk via `TEMPLATE_TAG`. |
| `@flazhost-nodeadmin/<pkg>@<ver>` | Memicu `release.yml` → publish ke npm. |

### Langkah rilis library/npm

1. Bump `version` di `packages/<pkg>/package.json`.
2. Commit dan push ke `main` — mirror otomatis mendeteksi versi baru dan push tag ke FlazHost-Com.
3. Verifikasi: `npm view @flazhost-nodeadmin/<pkg> version`.

> Perubahan docs-only pada README paket tetap butuh bump patch — npm tidak bisa overwrite versi yang sudah terbit.

---

---

## Topologi Tiga Repo

```
NodeJsTech-Id/NodeAdmin          ← SUMBER. Semua perubahan dilakukan di sini.
      │  mirror.yml: snapshot tree + forward tags (via MIRROR_TOKEN PAT)
      ▼
FlazHost-Com/NodeAdmin           ← Repo PUBLIK / open-source. JANGAN diedit langsung.
      │  (hasil mirror otomatis — akan tertimpa di mirror berikutnya)
      ├──► release.yml  → npm @flazhost-nodeadmin/*        (jalur library)
      └──► sync-runner.yml → kode app ke flazhost-runner   (jalur starter deploy)
                │
                ▼
flazhost-runner/nodeadmin        ← Repo DEPLOY (is_template: true).
                                   Kode app (auto-sync) + file deploy (milik repo ini).
```

**Prinsip:** SATU SUMBER (NodeJsTech-Id), propagasi SATU ARAH ke hilir. Tidak pernah commit ke FlazHost-Com maupun flazhost-runner secara langsung.

---

## Pembagian Tanggung Jawab

| Area | Lokasi edit | Cara rilis |
|------|-------------|------------|
| Kode app (UI, REST, config, .env.example) | `template/` di repo sumber | Tag `template-v*` → otomatis ke hilir |
| Library/npm (`@flazhost-nodeadmin/*`) | `packages/core\|cli\|create-app/` di repo sumber | Bump `version` → push `main` → otomatis publish |
| File deploy (Dockerfile, entrypoint, .github/) | Langsung di `flazhost-runner/nodeadmin` | Edit manual di runner — tidak tertimpa sync |

---

## Update App (template-v\* flow)

Gunakan alur ini saat ada perubahan pada kode aplikasi (`src/`, `public/`, `template/`, `.env.example`, dll).

```bash
# 1. Edit kode di template/ (atau src/ yang akan di-rebuild ke template/ saat mirror)
# 2. Commit ke main
git commit -am "feat: deskripsi perubahan"

# 3. Cek tag terakhir, lalu buat tag baru dan push
git tag -l 'template-v*' | sort -V | tail -1      # mis. template-v1.0.17
git tag template-v1.0.18
git push origin main --tags
```

Setelah push, propagasi berjalan **otomatis**:
1. `mirror.yml` — membangun snapshot bersih dan mem-forward tag `template-v*` ke FlazHost-Com (via `MIRROR_TOKEN` PAT).
2. `sync-runner.yml` di FlazHost-Com — terpicu oleh tag, men-sync `template/` ke `flazhost-runner/nodeadmin` (menggunakan GitHub App token).
3. File deploy di `flazhost-runner` (`Dockerfile`, `docker-entrypoint.sh`, `.dockerignore`, `.github/`) **tidak tersentuh** (di-exclude rsync).

**Verifikasi setelah rilis:**
```bash
# Tag hadir di FlazHost-Com
curl -s https://api.github.com/repos/FlazHost-Com/NodeAdmin/tags | grep template-v1.0.18

# Actions di FlazHost-Com/NodeAdmin → "Sync starter → flazhost-runner" harus hijau

# flazhost-runner ter-update
curl -s https://api.github.com/repos/flazhost-runner/nodeadmin | jq '.pushed_at'
```

---

## Update Library/npm (auto-publish via main)

Gunakan alur ini saat ada perubahan pada `packages/core`, `packages/cli`, atau `packages/create-app`.

```bash
# 1. Edit packages/<pkg>/package.json — naikkan "version"
# 2. Commit dan push ke main
git commit -am "release: @flazhost-nodeadmin/core@1.3.2"
git push origin main
```

`mirror.yml` **otomatis mendeteksi** versi baru vs npm dan mendorong tag `@flazhost-nodeadmin/<pkg>@<ver>` ke FlazHost-Com → memicu `release.yml` → `npx changeset publish` → terbit ke npmjs.

```bash
# Verifikasi
npm view @flazhost-nodeadmin/core version
npm view @flazhost-nodeadmin/create-app version
```

> Tidak perlu push tag secara manual. Cukup bump `version` di `package.json` dan push ke `main`.

---

## Secrets yang Diperlukan

| Secret | Letak | Fungsi |
|--------|-------|--------|
| `MIRROR_TOKEN` | NodeJsTech-Id/NodeAdmin → Settings → Secrets | Classic PAT scope `repo` + `workflow`; push snapshot + forward tag ke FlazHost-Com. |
| `RUNNER_SYNC_APP_ID` | FlazHost-Com/NodeAdmin → Org Secrets | GitHub App "flazhost-runner-sync" — App ID. |
| `RUNNER_SYNC_APP_KEY` | FlazHost-Com/NodeAdmin → Org Secrets | GitHub App — Private key (PEM). Butuh `Contents: Read & write` di repo `flazhost-runner/nodeadmin`. |
| `NPM_TOKEN` | FlazHost-Com/NodeAdmin → Secrets | npm Automation token; dipakai `release.yml` untuk `changeset publish`. |

---

## Aturan Emas

| | |
|---|---|
| **DO** | Edit kode app → di `template/` (repo sumber) |
| **DO** | Edit library → di `packages/core\|cli\|create-app` (bump versi → push main) |
| **DO** | Edit file deploy → langsung di `flazhost-runner/nodeadmin` (hanya 4 file: Dockerfile / docker-entrypoint.sh / .dockerignore / .github/) |
| **DON'T** | Edit FlazHost-Com/NodeAdmin langsung — tertimpa mirror berikutnya |
| **DON'T** | Edit kode app di flazhost-runner langsung — tertimpa sync berikutnya |
| **DON'T** | Taruh file deploy (Dockerfile dll) di FlazHost-Com atau repo sumber |
| **DON'T** | Simpan secret di file repo — pakai GitHub Secrets |

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| `sync-runner.yml` tidak terpicu setelah tag | Mirror forward tag pakai `GITHUB_TOKEN` bawaan (tidak memicu workflow turunan) | Pastikan step "Forward tag" di `mirror.yml` pakai `MIRROR_TOKEN` PAT |
| `sync-runner.yml` tidak ada di FlazHost-Com | File belum ter-mirror | Re-run mirror; cek `buildCleanMirror.js` tidak mengecualikan `.github/workflows/` |
| Sync gagal push ke flazhost-runner (403) | `RUNNER_SYNC_APP_ID/KEY` salah atau App belum diinstal di org `flazhost-runner` | Verifikasi GitHub App → installation → repo `nodeadmin` → `Contents: write` |
| File deploy hilang dari flazhost-runner | `--exclude` di `sync-runner.yml` tidak lengkap | Pastikan Dockerfile / docker-entrypoint.sh / .dockerignore / .github/ ada di daftar `--exclude` |
| `is_template: true` hilang | Push tidak mengubah setting, tapi bisa ter-reset jika repo di-reinit | Settings → Template repository → ON (atau `PATCH /repos/flazhost-runner/nodeadmin {"is_template":true}`) |
