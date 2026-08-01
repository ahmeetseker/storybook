// RealityKit AnimationLibraryComponent deseninden uyarlanmış adlandırılmış preset kaydı.
export const presets = {
  pressLiquefy: { displacementScale: 1.7, transformScale: 0.96 },
  springs: {
    press: { stiffness: 400, damping: 25 },
    jelly: { stiffness: 300, damping: 15 }, // düşük damping = bırakınca jöle salınımı
    sidebar: { stiffness: 260, damping: 32 }, // panel/highlight — salınımsız, yumuşak duruş
    // Yüzen bir yüzeyin dinlenme durumuna DÖNÜŞÜ. sidebar ile aynı karakterde
    // (kritik sönüm, salınım yok) ama belirgin şekilde daha yumuşak:
    // sönüm oranı 0.99, response 0.50s (sidebar: 0.99 / 0.39s).
    // Gerekçe: daralma "sisteme yanıt", büyüme "eve dönüş" — ikincisi aynı
    // hızda olduğunda ani hissettiriyor (bkz. GlassSiteHeader rules.md §7).
    settle: { stiffness: 160, damping: 25 },
  },
} as const
