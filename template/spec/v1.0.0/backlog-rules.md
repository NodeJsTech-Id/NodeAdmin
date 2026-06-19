# Backlog Enforcement v1.0.0

Prinsip yang kini **prosa-only** (lihat `conventions.md` §C). Tiap rule baru yang menutup celah ini → bump **minor spec** + entri `../CHANGELOG.md` + rilis `@flazhost-nodeadmin/cli` minor. App Node `npm update` → CI menangkap pelanggaran; app bahasa lain mengikuti delta spec.

Prioritas (paling berdampak keamanan/portabilitas dulu):

1. **SQL vendor di migration** — deteksi `ENGINE=`, backtick identifier, `AUTO_INCREMENT`, tipe vendor di folder `migrations/` (saat ini di-skip).
2. **Urutan middleware auth** — pastikan `ensureAuthenticated` mendahului `AccessMiddleware` di `routes/*.ts`.
3. **Rate-limit endpoint sensitif** — login/otp/reset wajib `authLimiter`/`otpLimiter`.
4. **CSRF form mutasi** — form POST/PUT/DELETE web wajib token (cek `foot.ejs`/csrf include).
5. **Validator stripUnknown** — isi validator wajib `{ stripUnknown: true }` + `req.body = value`.
6. **Registrasi DI** — token di `tokens.ts` punya pasangan registrasi di `container.ts`.
7. **Update README** — modul baru tercatat di README.

Catatan: rule yang tak bisa dicek mesin secara andal (mis. SoC, desain SOLID) tetap prosa + ditandai "manual-review", tidak dipaksa jadi gate.
