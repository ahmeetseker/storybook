import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __getServerSnapshotForTests,
  __rehydrateForTests,
  AUTO_CONFIRM_DELAY_MS,
  cancelAppointment,
  createAppointment,
  listAppointments,
  resetAppointmentStore,
  subscribeAppointments,
} from './appointment-store'

const STORAGE_KEY = 'arsam:randevular'

const ORNEK = {
  officeId: 'office-1',
  officeName: 'Kadıköy Anahtar Ofis',
  date: '2026-08-14',
  slot: '10:00',
  type: 'office' as const,
}

beforeEach(() => {
  vi.useFakeTimers()
  resetAppointmentStore()
})
afterEach(() => vi.useRealTimers())

describe('randevu store', () => {
  it('oluşturulan randevu pending durumuyla listede görünür', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    const items = listAppointments()
    expect(items).toHaveLength(1)
    expect(items[0].status).toBe('pending')
    expect(items[0].officeName).toBe('Kadıköy Anahtar Ofis')
  })

  it('autoConfirm randevu gecikme sonrasında confirmed olur ve aboneler bilgilendirilir', () => {
    const dinleyici = vi.fn()
    subscribeAppointments(dinleyici)
    createAppointment({ ...ORNEK, autoConfirm: true })
    expect(listAppointments()[0].status).toBe('pending')
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS)
    expect(listAppointments()[0].status).toBe('confirmed')
    expect(dinleyici).toHaveBeenCalled()
  })

  it('autoConfirm=false randevu gecikme geçse de pending kalır', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS * 3)
    expect(listAppointments()[0].status).toBe('pending')
  })

  it('iptal edilen randevu cancelled olur; onay zamanlayıcısı onu geri çeviremez', () => {
    const randevu = createAppointment({ ...ORNEK, autoConfirm: true })
    cancelAppointment(randevu.id)
    vi.advanceTimersByTime(AUTO_CONFIRM_DELAY_MS)
    expect(listAppointments()[0].status).toBe('cancelled')
  })

  it('liste en yeni randevuyu başa koyar', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    vi.advanceTimersByTime(10)
    const ikinci = createAppointment({ ...ORNEK, slot: '11:00', autoConfirm: false })
    expect(listAppointments()[0].id).toBe(ikinci.id)
  })

  it('listAppointments referansı değişiklik olmadıkça sabittir (useSyncExternalStore sözleşmesi)', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    expect(listAppointments()).toBe(listAppointments())
  })
})

describe('randevu store — sessionStorage kalıcılığı', () => {
  it('tam sayfa yenilemesini simüle eden rehydrate sonrasında randevu korunur', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull()

    __rehydrateForTests()

    const items = listAppointments()
    expect(items).toHaveLength(1)
    expect(items[0].officeName).toBe('Kadıköy Anahtar Ofis')
    expect(items[0].status).toBe('pending')
  })

  it('yeni id sayacı yenileme sonrasında çakışma üretmez', () => {
    const ilk = createAppointment({ ...ORNEK, autoConfirm: false })
    __rehydrateForTests()
    const ikinci = createAppointment({ ...ORNEK, slot: '11:00', autoConfirm: false })
    expect(ikinci.id).not.toBe(ilk.id)
  })

  it('iptal edilen randevu rehydrate sonrasında cancelled kalır', () => {
    const randevu = createAppointment({ ...ORNEK, autoConfirm: false })
    cancelAppointment(randevu.id)
    __rehydrateForTests()
    expect(listAppointments()[0].status).toBe('cancelled')
  })

  it('onay zamanlayıcısı tamamlanmadan yenilenen pending+autoConfirm kayıt hydrate anında confirmed olur', () => {
    createAppointment({ ...ORNEK, autoConfirm: true })
    // 4sn dolmadan "sayfa yenilendi": gerçek setTimeout kaybolur, yalnız
    // sessionStorage'daki kayıt kalır.
    __rehydrateForTests()
    expect(listAppointments()[0].status).toBe('confirmed')
  })

  it('cancelAppointment daha önce autoConfirm istenmiş bir kaydı hydrate sırasında geri açtırmaz', () => {
    const randevu = createAppointment({ ...ORNEK, autoConfirm: true })
    cancelAppointment(randevu.id)
    __rehydrateForTests()
    expect(listAppointments()[0].status).toBe('cancelled')
  })

  it('bozuk JSON ile hydrate boş listeye düşer, çökmez', () => {
    resetAppointmentStore()
    sessionStorage.setItem(STORAGE_KEY, '{bozuk-json')

    expect(() => __rehydrateForTests()).not.toThrow()
    expect(listAppointments()).toEqual([])
  })

  it('resetAppointmentStore sessionStorage kaydını da temizler', () => {
    createAppointment({ ...ORNEK, autoConfirm: false })
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull()
    resetAppointmentStore()
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('randevu store — şema sürümü ve kayıt doğrulama', () => {
  it('sürüm uyuşmazlığı olan payload tamamen atılır, boş listeye düşer', () => {
    resetAppointmentStore()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 999,
        nextId: 5,
        records: [{ appointment: { ...ORNEK, id: 'randevu-1', status: 'pending', createdAt: 1 }, autoConfirm: false }],
      }),
    )

    __rehydrateForTests()

    expect(listAppointments()).toEqual([])
  })

  it('sürüm alanı hiç yoksa (eski format) payload atılır', () => {
    resetAppointmentStore()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nextId: 5,
        records: [{ appointment: { ...ORNEK, id: 'randevu-1', status: 'pending', createdAt: 1 }, autoConfirm: false }],
      }),
    )

    __rehydrateForTests()

    expect(listAppointments()).toEqual([])
  })

  it('bozuk tarihli kayıt hydrate edilmez, diğer geçerli kayıtlar korunur', () => {
    resetAppointmentStore()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        nextId: 3,
        records: [
          { appointment: { ...ORNEK, id: 'randevu-1', date: 'gecersiz-tarih', status: 'pending', createdAt: 1 }, autoConfirm: false },
          { appointment: { ...ORNEK, id: 'randevu-2', status: 'pending', createdAt: 2 }, autoConfirm: false },
        ],
      }),
    )

    __rehydrateForTests()

    const items = listAppointments()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('randevu-2')
  })

  it('geçersiz slot/status/type alanına sahip kayıt atılır', () => {
    resetAppointmentStore()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        nextId: 2,
        records: [
          { appointment: { ...ORNEK, id: 'r-slot', slot: '10', status: 'pending', createdAt: 1 }, autoConfirm: false },
          { appointment: { ...ORNEK, id: 'r-status', status: 'onaylandı', createdAt: 1 }, autoConfirm: false },
          { appointment: { ...ORNEK, id: 'r-type', type: 'telefon', status: 'pending', createdAt: 1 }, autoConfirm: false },
        ],
      }),
    )

    __rehydrateForTests()

    expect(listAppointments()).toEqual([])
  })
})

describe('randevu store — useAppointments sunucu anlık görüntüsü (hydration uyuşmazlığı regresyonu)', () => {
  // useSyncExternalStore internals'ini (getServerSnapshot) doğrudan render
  // etmeden test etmek awkward olduğundan (renderToString + hydrateRoot
  // kurulumu gerektirir), burada dışa açılan sabiti/işlevi doğrudan
  // sınıyoruz: asıl regresyon riski "getServerSnapshot her çağrıda AYNI
  // referansı döner mi" ve "hydrate() sonrası da boş kalır mı" sorularıdır —
  // ikisi de bu şekilde tam olarak doğrulanabiliyor.
  it('getServerSnapshot referansı her çağrıda sabittir (sonsuz döngüyü önler)', () => {
    expect(__getServerSnapshotForTests()).toBe(__getServerSnapshotForTests())
  })

  it('getServerSnapshot her zaman boştur', () => {
    expect(__getServerSnapshotForTests()).toEqual([])
  })

  it('hydrate() sonrası store dolsa da getServerSnapshot referansı ve içeriği değişmez', () => {
    const oncekiReferans = __getServerSnapshotForTests()
    createAppointment({ ...ORNEK, autoConfirm: false })
    __rehydrateForTests()

    expect(listAppointments()).toHaveLength(1) // store dolu — mismatch senaryosu kurulu
    expect(__getServerSnapshotForTests()).toBe(oncekiReferans)
    expect(__getServerSnapshotForTests()).toEqual([])
  })
})
