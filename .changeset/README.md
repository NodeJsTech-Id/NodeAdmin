# Changesets

Manajemen versi & rilis paket workspace (`@flazhost-nodeadmin/core`, `@flazhost-nodeadmin/cli`) via [changesets](https://github.com/changesets/changesets) → npm publik.

## Status (Phase 0)
Kerangka. **Belum aktif** — `@changesets/cli` belum diinstal & paket `packages/*` belum berisi (lihat roadmap). Publish nyata dimulai Phase 4.

## Alur saat aktif (Phase 4)
1. Setelah perubahan: `npx changeset` → pilih paket + bump (patch/minor/major) + tulis ringkasan.
2. `npx changeset version` → bump versi + update CHANGELOG paket.
3. Merge ke `main` → CI release menjalankan `npx changeset publish` → publish ke npm + buat git tag `vX.Y.Z` (immutable).

## Prinsip versi
- Versi = tag/release immutable + semver. BUKAN satu-branch-per-versi.
- Tutup celah enforcement (rule checker baru) → **minor** + sinkron `spec/` minor + entri `spec/CHANGELOG.md`.
- Breaking change API core → **major**; app pin range `^1.x` aman dari lonjakan major.
