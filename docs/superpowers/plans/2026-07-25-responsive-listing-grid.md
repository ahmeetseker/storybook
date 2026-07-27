# Responsive Listing Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emlak sonuç ızgarasını ekran alanına göre bir ile dört sütun arasında ölçeklemek.

**Architecture:** Mevcut `EmlakSearchView` markup ve veri akışı korunur. Yoğunluk yalnız CSS container query kurallarıyla yönetilir; bölünmüş harita görünümü için ayrı bir sınıf bağlamı kullanılır.

**Tech Stack:** React 19, CSS Modules, Vitest, Storybook, Vite

## Global Constraints

- Component CSS yalnız `--lg-*` token’larını tüketir.
- Liste görünümü değişmez.
- Mobil bir, tablet iki, masaüstü üç ve geniş masaüstü dört sütun gösterir.
- Bölünmüş görünüm bir veya iki sütunla sınırlıdır.

---

### Task 1: Responsive ızgara yoğunluğu

**Files:**
- Modify: `apps/web/src/features/listings/EmlakSearchView.module.css`
- Test: `apps/web/src/features/listings/EmlakSearchView.test.tsx`

**Interfaces:**
- Consumes: `gridList`, `withMap` ve mevcut `listing` CSS sınıfları
- Produces: Bir ile dört sütun arasında ölçeklenen sonuç ızgarası

- [ ] **Step 1: Mevcut görünüm sınıfı testini çalıştır**

Run: `npx vitest run apps/web/src/features/listings/EmlakSearchView.test.tsx`
Expected: PASS

- [ ] **Step 2: Adaptif sütun kurallarını ekle**

`gridList` için tablet, standart masaüstü ve geniş masaüstü container
eşiklerinde sırasıyla iki, üç ve dört sütun tanımla. `withMap .gridList`
için dar alanda en fazla iki sütun kullan.

- [ ] **Step 3: Kartı dar sütuna uyarla**

Izgara kartının medya oranını kompaktlaştır, başlığı CSS line clamp ile iki
satırla sınırla ve liste görünümündeki yatay kart kurallarını koru.

- [ ] **Step 4: Hedef testleri çalıştır**

Run: `npx vitest run apps/web/src/features/listings/EmlakSearchView.test.tsx`
Expected: PASS

- [ ] **Step 5: Kalite kapılarını çalıştır**

Run: `npm run lint && npm run typecheck:web && npm run build`
Expected: Komutların tamamı exit code 0 ile biter.
