# @flazhost-nodeadmin/create-app

## 1.0.9

### Patch Changes

- Tambah opsi API-only pada scaffolder: `npm create @flazhost-nodeadmin/app myapp --api` (atau prompt pilih) menghasilkan app REST-only tanpa UI. Core `createApp` dukung `mode: 'all' | 'api'` (default 'all', backward-compatible). Plus housekeeping deps (uuid@11, typeorm 0.3.30, better-sqlite3 12, hapus @types stub).

## 1.0.8

### Patch Changes

- Arahkan ke template-v1.0.4 (better-sqlite3 ^12 dgn prebuilt Node 22 → install cepat tanpa compile).

## 1.0.7

### Patch Changes

- Tambah section Tampilan (screenshot UI) di README create-app.

## 1.0.6

### Patch Changes

- README create-app lebih lengkap: badge, tabel fitur, mulai cepat, ganti DB, prasyarat, tautan.

## 1.0.5

### Patch Changes

- Arahkan ke template-v1.0.3 (README app turunan kini lengkap, bukan ringkas).

## 1.0.4

### Patch Changes

- Uji ulang rantai rilis otomatis (CI → mirror → release.yml → npm) dengan NPM_TOKEN baru.

## 1.0.3

### Patch Changes

- Uji rantai rilis otomatis (CI → mirror → release.yml → npm). Tanpa perubahan fungsional.

## 1.0.2

### Patch Changes

- Arahkan sumber template ke repo bersih `FlazHost-Com/NodeAdmin` (tanpa materi porting/spec bahasa lain) dan template-v1.0.2.
