export type AppointmentType = 'office' | 'video'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Appointment {
  id: string
  officeId: string
  officeName: string
  /** ISO gün anahtarı, ör. '2026-08-14' — saat `slot`ta ayrı taşınır */
  date: string
  /** 'HH:00' biçiminde saat dilimi */
  slot: string
  type: AppointmentType
  note?: string
  status: AppointmentStatus
  /** Sıralama için; ms epoch */
  createdAt: number
}

export interface AppointmentSlot {
  time: string
  available: boolean
}
