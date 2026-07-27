# Listing Glass Select Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emlak aramasındaki Kategori, Şehir ve Sıralama kontrollerini ortak, temalı `GlassSelect` listbox deneyimine geçirmek.

**Architecture:** `EmlakSearchView` mevcut state callback’lerini korur ve yalnız native select adaptörlerini `GlassSelect` değer callback’leriyle değiştirir. Seçenek verileri mevcut sabitlerden üretilir; erişilebilir adlandırma benzersiz `useId` değerleriyle sağlanır.

**Tech Stack:** React 19, GlassSelect, CSS Modules, Testing Library, Vitest

## Global Constraints

- CSS yalnız `--lg-*` token’larını tüketir.
- Controlled `value` ve `onChange` deseni korunur.
- Klavye ve screen-reader davranışı gerilemez.
- Kategori, Şehir ve Sıralama aynı component’i kullanır.

---

### Task 1: Seçim kontrollerini GlassSelect'e geçir

**Files:**
- Modify: `apps/web/src/features/listings/EmlakSearchView.tsx`
- Modify: `apps/web/src/features/listings/EmlakSearchView.module.css`
- Test: `apps/web/src/features/listings/EmlakSearchView.test.tsx`

**Interfaces:**
- Consumes: `GlassSelectProps`, `CATEGORY_OPTIONS`, `CITY_OPTIONS`, `SORT_OPTIONS`
- Produces: Temalı ve controlled üç combobox

- [ ] **Step 1: Başarısız component testini yaz**

Şehir combobox’ını aç, `İzmir` seçeneğini seç ve callback’in `city: 'izmir'`
ile çağrıldığını doğrula. Native `select` bulunmadığını ayrıca doğrula.

- [ ] **Step 2: Testi çalıştır ve başarısızlığı doğrula**

Run: `npx vitest run apps/web/src/features/listings/EmlakSearchView.test.tsx`
Expected: GlassSelect listbox beklentisi nedeniyle FAIL.

- [ ] **Step 3: Minimal dönüşümü uygula**

Üç native select’i `GlassSelect` ile değiştir, option tuple’larını
`{ value, label }` biçimine dönüştür ve mevcut state güncellemelerini koru.

- [ ] **Step 4: Hedef testi çalıştır**

Run: `npx vitest run apps/web/src/features/listings/EmlakSearchView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Kalite kapılarını çalıştır**

Run: `npm test && npm run lint && npm run typecheck:web && npm run build`
Expected: Tüm komutlar exit code 0 ile biter.
