# NodeAdmin Spec — Conventions v1.0.0

Katalog **deklaratif** aturan yang menegakkan prinsip NodeAdmin. Inilah kontrak yang harus direplikasi app turunan (Node maupun bahasa lain) agar fungsional & arsitektural setara.

- **Enforced** = ada rule otomatis di checker (`@nodeadmin/cli` → `checkConventions`). Pelanggaran = gate gagal (exit 1).
- **Prosa-only** = dinyatakan di AGENTS.md tapi belum ada penegak mesin → manual-review. Kandidat rule versi berikutnya (lihat `backlog-rules.md`).

Snapshot dibekukan dari `tools/checkConventions.js` + `AGENTS.md` pada rilis v1.0.0. Sumber kebenaran enforcement = checker; dokumen ini adalah pernyataan deklaratifnya untuk porting lintas-bahasa.

---

## A. Rule pola/prinsip (per-file) — ENFORCED

| ID | Aturan | Yang dicek | Target |
|----|--------|------------|--------|
| R1a | Larang `instanceof Error` | match `\binstanceof Error\b` | semua `*.ts` kecuali `errors/AppError.ts` & `middleware/errorHandler.ts` |
| R1b | Larang `return error` | match `^\s*return error\b` | sda |
| R2a | Route tak boleh `new XController()` | match `new \w+Controller\(` | `**/routes/*.ts` |
| R2b | Route tak boleh `new XService()` | match `new \w+Service\(` | `**/routes/*.ts` |
| R3a | Service wajib `@injectable()` | absence `@injectable()` | `**/services/v1/<X>Service.ts` |
| R3b | Service wajib `implements I<Base>` | absence `implements I<base>` | sda |
| R3c | File interface `I<X>Service.ts` wajib ada | filesystem exists | sda |
| R4 | Web controller pakai `renderView` (larang `res.render(path.resolve)`) | match terlarang | `**/controllers/*Controller.ts` |
| R5a | Tipe kolom portabel (larang `longtext/mediumtext/tinytext/datetime`) | regex entity | `**/*.entity.ts` |
| R5b | `@Create/UpdateDateColumn` tanpa `type` eksplisit | regex | `**/*.entity.ts` |
| R5c | Larang `collation` hardcoded | match `\bcollation:` | `**/*.entity.ts` |
| R6a | Larang raw query di modul (`.query(`/`createQueryRunner(`) | regex | `src/modules/**` |
| R6b | Larang `LIKE :param` manual (wajib helper `ciLike`) | regex | `src/modules/**` |
| R7 | Larang `process.env.` di modul (wajib via config env) | regex | `src/modules/**` |

## B. Rule kelengkapan kontekstual (per-modul) — ENFORCED (gate)

| ID | Kondisi → wajib | Mekanisme |
|----|-----------------|-----------|
| C1 | Entity → migration | scan `.entity.ts` + folder `migrations/` |
| C2 | Input tulis (store/update) → validator | regex service + cek `http/validators/` |
| C3 | Views → route web | scan `.ejs` + cek `routes/web.ts` |
| C4 | Fitur ber-route → ≥1 test | nama test mengandung subjek modul |
| C5 | Service → integration test | nama test `integration` + subjek |
| C6 | Service+views (user-facing) → BDD | `tests/bdd/features/*` menyebut subjek |
| C7 | `routes/api.ts` → api test | nama test `/api/` + subjek |
| C8 | API → terdokumentasi di `docs/API.md` | baca docs |

## C. Prinsip PROSA-ONLY (belum ter-enforce → manual-review)

- Inject via constructor + token registry (`tokens.ts`/`container.ts`) — hanya tsc/test yang menangkap bila salah.
- Controller tak menangani error manual (tak ada cek try/catch di controller).
- Separation of Concerns (logika bisnis tak bocor ke controller/view).
- Migration pakai Table API portabel, BUKAN raw SQL vendor (`ENGINE=`, backtick, `AUTO_INCREMENT`) — folder `migrations` di-skip checker.
- Security: urutan `ensureAuthenticated` SEBELUM `AccessMiddleware`; CSRF form mutasi; rate-limit endpoint sensitif; upload via magic-byte fileService; error tak bocor di production; tanpa hardcode secret.
- Validator pakai `{ stripUnknown: true }` + `req.body = value` (anti mass-assignment) — C2 hanya memaksa validator *ada*, isi tak dicek.
- Update README untuk modul baru.

Daftar C ini = **backlog enforcement** (lihat `backlog-rules.md`).
