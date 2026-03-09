# SIFPI Frontend - Catatan Pengembangan

## Identitas

| Field | Value                     |
| ----- | ------------------------- |
| Nama  | Muhammad Hibrizi Farghana |
| NPM   | 2306165585                |
| Kelas | Propensi A                |

---

## Sprint 1

### PBI: UM-1 — Login

**FE Acceptance Criteria:**

- [x] Halaman Login menampilkan form dengan field: Email (text input) dan Password (password input).
- [x] Terdapat tombol "Login" yang hanya aktif jika kedua field terisi.
- [x] Validasi real-time: format email valid.
- [x] Jika login gagal, tampilkan pesan error sesuai response BE (email tidak terdaftar / password salah / akun nonaktif / belum terverifikasi).
- [x] Jika login berhasil, redirect sesuai role:
  - admin → /admin/dashboard
  - owner → /owner/dashboard
  - investor → /catalogue
  - executive → /admin/insights
- [x] Link "Belum punya akun? Daftar di sini" mengarah ke halaman Register.
- [x] Link "Lupa Password" mengarah ke halaman lupa password.

**File terkait:**

- `src/app/(public)/login/page.tsx`
- `src/features/auth/components/login-form.tsx`
- `src/features/auth/service/index.ts`

---

### PBI: UM-13 — Create New Role

**FE Acceptance Criteria:**

- [x] Form: Nama Role, Deskripsi, Status.
- [x] Matrix permission (checkbox read/create/update/delete).
- [x] Tombol Simpan & Draft.
- [x] Validasi nama role duplicate.

**File terkait:**

- `src/app/admin/access/role/create/page.tsx`
- `src/features/access/components/role-create-form.tsx`
- `src/features/access/hooks/use-create-role-form.ts`

---

### PBI: PM-8 — Create Project Bulk Upload

**FE Acceptance Criteria:**

- [x] Halaman "Batch Upload" dengan area upload file (CSV/XLSX).
- [x] Tombol download template CSV dengan header kolom sesuai field.
- [x] Setelah upload, tampilkan preview tabel data yang akan diimport.
- [x] Highlight row yang gagal validasi dengan pesan error per cell.
- [x] Tombol "Import Valid Data" untuk memproses row yang lolos validasi.
- [x] Setelah selesai, tampilkan summary: X berhasil, Y gagal.

**File terkait:**

- `src/app/admin/projects/page.tsx` — halaman manajemen proyek (trigger)
- `src/app/admin/projects/import/page.tsx` — route halaman import
- `src/features/project/pages/import-project/index.tsx` — halaman utama import (preview tabel, validasi, submit)
- `src/features/project/components/bulk-import-project-trigger.tsx` — modal upload file CSV/XLSX + download template
- `src/features/project/utils/csv.ts` — parsing & validasi CSV, session draft management
- `src/features/project/service/index.ts` — `batchUploadProjects()` → POST /api/admin/projects/batch-upload
- `src/features/project/types/import-project.ts` — tipe request/response batch upload
- `src/shared/lib/csv.ts` — shared CSV utilities (dipakai juga oleh user-management)
