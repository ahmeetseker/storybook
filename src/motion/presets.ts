// RealityKit AnimationLibraryComponent deseninden uyarlanmış adlandırılmış preset kaydı.
export const presets = {
  pressLiquefy: { displacementScale: 1.7, transformScale: 0.96 },
  springs: {
    press: { stiffness: 400, damping: 25 },
    jelly: { stiffness: 300, damping: 15 }, // düşük damping = bırakınca jöle salınımı
  },
} as const
