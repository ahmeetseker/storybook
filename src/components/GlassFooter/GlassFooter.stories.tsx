import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import {
  GlassFooter,
  type GlassFooterColumn,
  type GlassFooterHighlights,
  type GlassFooterSocialLink,
} from "./GlassFooter";
import { GlassButton } from "../GlassButton";
import { placeholderImage } from "../../demo/placeholderImage";

const columns: GlassFooterColumn[] = [
  {
    title: "Keşfet",
    links: [
      { label: "Arsa ara", href: "/arsa-ara" },
      { label: "Bölgeler", href: "/bolgeler" },
      { label: "Emlak ofisleri", href: "/ofisler" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Karar araçları",
    links: [
      { label: "AI danışman", href: "/ai-danisman" },
      { label: "Karşılaştır", href: "/karsilastir" },
      { label: "Favoriler", href: "/favoriler" },
      { label: "Güven merkezi", href: "/konseptler/guven-merkezi" },
    ],
  },
  {
    title: "İlan ve hesap",
    links: [
      { label: "İlan ver", href: "/ilan-ver" },
      { label: "Hesabım", href: "/hesabim" },
      { label: "Mesajlar", href: "/hesabim/mesajlar" },
      { label: "Ana sayfa konseptleri", href: "/konseptler" },
    ],
  },
];

// Vitrin kolonu: marka + link sütunları + son eklenen ilanlar — geniş footer'ın
// tam anatomisi. Üç link sütunu + vitrin, 1120px içerik genişliğine oturur.
const highlights: GlassFooterHighlights = {
  title: "Son eklenen ilanlar",
  items: [
    ["İzmir Urla Denize 900 m, İmarlı Köşe Parsel", "4.250.000 TL", "Urla", "#3a6f5f", "#1f4a3a"],
    ["Antalya Kaş Deniz Manzaralı Arsa", "6.900.000 TL", "Kaş", "#3a7a8a", "#1f4a5f"],
    ["Ankara Gölbaşı Yol Cepheli Yatırımlık Tarla", "1.850.000 TL", "Gölbaşı", "#8a6f3a", "#5f4a1f"],
    ["Balıkesir Ayvalık Müstakil Tapulu Zeytinlik", "3.980.000 TL", "Ayvalık", "#5f6f3a", "#35431c"],
  ].map(([label, meta, etiket, from, to], index) => ({
    id: `ilan-${index}`,
    label,
    meta,
    href: "/ilan/1084526631",
    image: placeholderImage(etiket, from, to, 120, 120),
  })),
};

const Brand = () => (
  <span
    style={{
      display: "flex",
      maxWidth: "34ch",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "var(--lg-space-2)",
    }}
  >
    <a
      href="/"
      style={{
        color: "var(--lg-label)",
        fontSize: "var(--lg-text-headline)",
        fontWeight: 700,
        letterSpacing: "-0.022em",
        textDecoration: "none",
      }}
    >
      arsam.net
    </a>
    <span style={{ fontSize: "var(--lg-text-body)", lineHeight: 1.5 }}>
      Arsayı konum, imar ve doğrulama verileriyle keşfet.
    </span>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--lg-space-1)",
        color: "var(--lg-label-secondary)",
        fontSize: "var(--lg-text-footnote)",
        fontWeight: 600,
      }}
    >
      <span aria-hidden>✓</span>
      Doğrulama durumu her ilanda görünür.
    </span>
  </span>
);

/** `socialLinks` ikonu — daireyi ve erişilebilir adı component çizer. */
const SocialGlyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);

/** Eski serbest `social` slotu — daireyi çağıran çizer (bkz. SerbestSosyalSlot). */
const SocialIcon = ({
  href,
  label,
  d,
}: {
  href: string;
  label: string;
  d: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    style={{
      display: "inline-grid",
      width: "var(--lg-control-md)",
      minHeight: "var(--lg-control-md)",
      placeItems: "center",
      border: "var(--lg-border-width, 1px) solid var(--lg-hairline)",
      borderRadius: "var(--lg-radius-capsule)",
      color: "var(--lg-label-secondary)",
    }}
  >
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d={d} />
    </svg>
  </a>
);

const Social = () => (
  <>
    <SocialIcon
      href="https://x.com"
      label="X"
      d="M4 4l7.2 9.6L4.4 20h2.6l5.4-5.1 3.8 5.1H20l-7.5-10L19.4 4h-2.6l-4.9 4.7L8.4 4H4z"
    />
    <SocialIcon
      href="https://instagram.com"
      label="Instagram"
      d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 12.9a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zM17.4 7.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
    />
    <SocialIcon
      href="https://youtube.com"
      label="YouTube"
      d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"
    />
    <SocialIcon
      href="https://linkedin.com"
      label="LinkedIn"
      d="M6.5 8.5V19H3.4V8.5h3.1zM4.9 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM20.6 13v6h-3.1v-5.4c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3.1V8.5h3.1v1.4c.4-.6 1.2-1.6 2.9-1.6 2.1 0 3.7 1.4 3.7 4.7z"
    />
  </>
);

const legal = "© 2026 arsam.net · Tüm hakları saklıdır.";

// Alt barın sağ ucu: ikonlar dekoratif, erişilebilir ad `label`'dan gelir.
const socialLinks: GlassFooterSocialLink[] = [
  {
    id: "x",
    label: "X",
    href: "https://x.com",
    icon: <SocialGlyph d="M4 4l7.2 9.6L4.4 20h2.6l5.4-5.1 3.8 5.1H20l-7.5-10L19.4 4h-2.6l-4.9 4.7L8.4 4H4z" />,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com",
    icon: <SocialGlyph d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 12.9a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zM17.4 7.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />,
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://youtube.com",
    icon: <SocialGlyph d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: <SocialGlyph d="M6.5 8.5V19H3.4V8.5h3.1zM4.9 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM20.6 13v6h-3.1v-5.4c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3.1V8.5h3.1v1.4c.4-.6 1.2-1.6 2.9-1.6 2.1 0 3.7 1.4 3.7 4.7z" />,
  },
];

const meta = {
  title: "Bileşenler/Vitrin ve Yerleşim/GlassFooter",
  component: GlassFooter,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: { columns, legal, brand: <Brand />, highlights, socialLinks },
} satisfies Meta<typeof GlassFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {};

export const Slim: Story = {
  args: {
    variant: "slim",
    columns: [
      {
        title: "Kısa yollar",
        links: [
          { label: "Arsa ara", href: "/arsa-ara" },
          { label: "İlan ver", href: "/ilan-ver" },
          {
            label: "Güven merkezi",
            href: "/konseptler/guven-merkezi",
          },
        ],
      },
    ],
  },
};

const ctaContent = (
  <>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--lg-space-1)",
      }}
    >
      <strong
        style={{
          fontSize: "var(--lg-text-headline)",
          letterSpacing: "-0.022em",
        }}
      >
        Arsanı bugün listele
      </strong>
      <span
        style={{
          color: "var(--lg-label-secondary)",
          fontSize: "var(--lg-text-footnote)",
        }}
      >
        İlk ilan ücretsiz — EİDS doğrulaması dahil.
      </span>
    </div>
    <GlassButton prominent size="lg">
      İlan Ver
    </GlassButton>
  </>
);

export const Cta: Story = {
  name: "CTA Bantlı",
  args: { variant: "cta", cta: ctaContent },
};

export const Centered: Story = {
  args: { variant: "centered", brand: "arsam.net" },
};

const newsletterContent = (
  <>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--lg-space-1)",
      }}
    >
      <strong
        style={{
          fontSize: "var(--lg-text-headline)",
          letterSpacing: "-0.022em",
        }}
      >
        Fırsatları kaçırma
      </strong>
      <span
        style={{
          color: "var(--lg-label-secondary)",
          fontSize: "var(--lg-text-footnote)",
        }}
      >
        Haftalık yeni ilan ve bölge raporu bülteni.
      </span>
    </div>
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--lg-space-2)",
      }}
    >
      <input
        aria-label="E-posta adresi"
        placeholder="e-posta@ornek.com"
        style={{
          minHeight: "var(--lg-control-md)",
          paddingInline: "var(--lg-space-4)",
          border: "var(--lg-border-width, 1px) solid var(--lg-hairline)",
          borderRadius: "var(--lg-radius-capsule)",
          background: "var(--lg-surface)",
          color: "var(--lg-label)",
          font: "inherit",
          fontSize: "var(--lg-text-footnote)",
        }}
      />
      <GlassButton prominent type="submit">
        Abone Ol
      </GlassButton>
    </form>
  </>
);

export const Newsletter: Story = {
  name: "Bülten Kayıtlı",
  args: { variant: "newsletter", newsletter: newsletterContent },
};

export const VaryantKarsilastirma: Story = {
  name: "Varyant Karşılaştırma",
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--lg-space-7)",
        paddingBottom: "var(--lg-space-7)",
      }}
    >
      {(["columns", "slim", "cta", "centered", "newsletter"] as const).map(
        (variant) => (
          <section key={variant}>
            <h3
              style={{
                margin: "0 0 var(--lg-space-2)",
                paddingInline: "var(--lg-space-5)",
                color: "var(--lg-label-secondary)",
                fontSize: "var(--lg-text-footnote)",
                fontWeight: 600,
              }}
            >
              variant="{variant}"
            </h3>
            <GlassFooter
              {...args}
              variant={variant}
              cta={variant === "cta" ? ctaContent : undefined}
              newsletter={
                variant === "newsletter" ? newsletterContent : undefined
              }
            />
          </section>
        ),
      )}
    </div>
  ),
};

export const UzunIcerik: Story = {
  name: "Uzun İçerik",
  args: {
    columns: [
      ...columns,
      {
        title: "Değerlendirilebilecekleriniz",
        links: [
          {
            label: "Kişiselleştirilemeyenlerimizdenmişsinizcesine uzun etiket",
            href: "/arsa-ara",
          },
          {
            label: "Elektroensefalografi cihazı ilanları",
            href: "/arsa-ara",
          },
          {
            label: "Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizden",
            href: "/arsa-ara",
          },
        ],
      },
    ],
  },
};

export const Responsive: Story = {
  name: "Responsive · 390 px",
  parameters: {
    viewport: { defaultViewport: "mobile390" },
    docs: {
      description: {
        story:
          "Dar kapsayıcıda marka, dört bilgi grubu ve legal satırı tek sütunda; sola hizalı ve yatay taşma olmadan akar.",
      },
    },
  },
};

function FocusPreview() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLAnchorElement>("nav a")?.focus();
  }, []);

  return (
    <div ref={rootRef}>
      <GlassFooter
        columns={columns}
        legal={legal}
        brand={<Brand />}
        social={<Social />}
      />
    </div>
  );
}

export const Focus: Story = {
  name: "Focus görünümü",
  render: () => <FocusPreview />,
  parameters: {
    docs: {
      description: {
        story:
          "İlk alt bilgi bağlantısı programatik olarak odaklanır; görünür 2 px accent halkası klavye sözleşmesini gösterir.",
      },
    },
  },
};

export const VitrinsizVeSosyalsiz: Story = {
  name: "Vitrinsiz — yalnız link sütunları",
  args: { highlights: undefined, socialLinks: undefined },
  parameters: {
    docs: {
      description: {
        story:
          "Vitrin kolonu ve sosyal bağlantılar opsiyoneldir; ikisi de yokken footer link " +
          "sütunlarına iner ve orta blok kalan genişliği alır.",
      },
    },
  },
};

export const SerbestSosyalSlot: Story = {
  name: "Serbest sosyal slot",
  args: { socialLinks: undefined, social: <Social /> },
  parameters: {
    docs: {
      description: {
        story:
          "`socialLinks` yerine `social` ReactNode'u da verilebilir — o zaman daireyi ve " +
          "erişilebilir adı çağıran çizer. İkisi birlikte verilirse `socialLinks` kazanır.",
      },
    },
  },
};

export const Erisilebilirlik: Story = {
  name: "Erişilebilirlik",
  parameters: {
    docs: {
      description: {
        story:
          "Tab sırası: marka bağlantısı → sütun linkleri (soldan sağa, yukarıdan aşağı) → vitrin ilanları → sosyal ikonlar. " +
          "Vitrin görselleri dekoratiftir (alt=\"\"); sosyal ikonlar aria-hidden, ad `label`'dan gelir. " +
          'Sütun başlıkları heading değildir; tek landmark çifti: contentinfo + "Alt bilgi" nav. ' +
          "Klavyeyle gezinip :focus-visible halkasını doğrulayın.",
      },
    },
  },
};
