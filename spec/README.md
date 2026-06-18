# NodeAdmin Spec — Prinsip Berversi (jalur multi-bahasa)

Spec adalah **kontrak deklaratif** prinsip, konvensi, dan kapabilitas NodeAdmin, **berversi semver dan immutable**. Ia jalur distribusi untuk app porting **bahasa lain** (Laravel/Go/Spring/Django/.NET/Rust) yang tak bisa menarik paket npm `@nodeadmin/core`/`@nodeadmin/cli`.

## Cara pakai (app turunan)
1. Pin satu versi spec, mis. `spec/v1.0.0`.
2. Replikasi: konvensi (`conventions.md`), seluruh **Capability Checklist** (`docs/PORTING_GUIDE.md` §Capability Checklist), katalog UI (`docs/UI_COMPONENTS.md`), pakai prompt di `docs/examples/PORT_PROMPTS.md`.
3. Wajib bangun ulang **checker** versi bahasa target yang menegakkan rule di `conventions.md` §A+§B — karena prinsip hidup lewat penegak, bukan dokumen.

## Cara naik versi
Saat pabrik rilis `spec/vX.Y.Z` baru: baca `CHANGELOG.md` untuk **delta**, lalu sesuaikan checker & kode app bahasa target mengikuti perubahan. Versi lama tetap utuh (immutable) untuk rollback/acuan.

## Hubungan dengan jalur Node
| | Node app | App bahasa lain |
|---|---|---|
| Runtime | `@nodeadmin/core` (npm) | core bahasa sendiri, ikut spec |
| Tooling/checker | `@nodeadmin/cli` (npm) | port checker per spec |
| Prinsip | spec + checker | spec + checker (port) |
| "Ubah prinsip → menyesuaikan" | otomatis (`npm update cli` → CI gagal di pelanggaran) | semi-manual (bump spec → port ulang checker) |

Versi = tag/release immutable, BUKAN satu-branch-per-versi.
