# GitHub Copilot Instructions — Node Admin

Aturan lengkap & wajib ada di **AGENTS.md** (sumber kebenaran). Patuhi itu. Ringkas:

- Arsitektur: route → `handler(Controller, 'method')` (DI) → Controller `@injectable` (inject `IService`) → Service `@injectable` `implements IService` (`throw AppError`) → Repository (inject) → Entity.
- Gunakan helper yang ada (DRY): `paginate`, `ciLike`, `renderView`, `removeEmptyFields`.
- JANGAN: `new XService/XController` di routes; `return error`/`instanceof Error`; `res.render(path.resolve)`; `process.env` di `src/modules`; tipe kolom `longtext`/`datetime` atau `@CreateDateColumn({type})`.
- Service wajib `@injectable` + interface `I*Service` + injeksi dual-mode.
- Modul baru: ikuti `docs/MODULE_GUIDE.md`; sertakan test + update `README.md` & `docs/API.md`.
- Sebelum commit: `npm run lint:conventions` + `npx tsc --noEmit` + `npm test` harus lolos.
- Security: `ensureAuthenticated` sebelum `AccessMiddleware`; CSRF token; rate-limit login/OTP; Joi `stripUnknown`.
