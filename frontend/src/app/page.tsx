import Link from "next/link";
import styles from "./page.module.scss";
import { FeaturedProducts } from "@/components/products/FeaturedProducts";
import { FeaturedShops } from "@/components/products/FeaturedShops";

export default function Home() {
  return (
    <div className={styles.page}>

      <nav className={styles.nav}>
        <span className={styles.logo}>ESSENCE</span>
        {/* <div className={styles.navLinks}>
          <Link href="/dashboard/products">Products</Link>
          <Link href="/shops">Shops</Link>
          <Link href="/dashboard/my-orders">Orders</Link>
        </div> */}
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>Sign in</Link>
          {/* <Link href="/products" className={styles.navCta}>Shop now</Link> */}
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroLabel}>New collection · 2025</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroLine1}>Skin that</span>
          <span className={styles.heroLine2}>speaks</span>
          <span className={styles.heroLine3}>for itself.</span>
        </h1>
        <p className={styles.heroSub}>
          Premium skincare crafted for people who believe<br />
          beauty begins with intention.
        </p>
        {/* <div className={styles.heroCtas}>
          <Link href="/products" className={styles.heroBtnPrimary}>
            Explore collection
          </Link>
          <Link href="/dashboard/my-orders" className={styles.heroBtnSecondary}>
            View orders →
          </Link>
        </div> */}
        <div className={styles.heroBadge}>
          <span>Free shipping</span>
          <span className={styles.heroBadgeDot} />
          <span>Orders over $100</span>
        </div>
      </section>

      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={styles.marqueeInner}>
              Radiance &nbsp;·&nbsp; Clarity &nbsp;·&nbsp; Balance &nbsp;·&nbsp;
              Glow &nbsp;·&nbsp; Restore &nbsp;·&nbsp; Protect &nbsp;·&nbsp;
              Nourish &nbsp;·&nbsp; Renew &nbsp;·&nbsp; Illuminate &nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <FeaturedProducts />

      <FeaturedShops />

      <section className={styles.features}>
        {FEATURES.map((f, i) => (
          <div key={i} className={styles.featureCard}>
            <span className={styles.featureIcon}>{f.icon}</span>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerInner}>
          <p className={styles.bannerEyebrow}>Limited time</p>
          <h2 className={styles.bannerTitle}>Start your ritual today.</h2>
          <p className={styles.bannerSub}>
            Curated sets for every skin type. Free returns within 30 days.
          </p>
          <Link href="/products" className={styles.bannerBtn}>
            Shop the collection
          </Link>
        </div>
        <div className={styles.bannerOrbs} aria-hidden>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>ESSENCE</span>
        <p className={styles.footerText}>© 2025 ESSENCE Skincare. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link href="/products">Shop</Link>
          <Link href="/shops">Shops</Link>
          <Link href="/dashboard/my-orders">Orders</Link>
          <Link href="/login">Account</Link>
        </div>
      </footer>

    </div>
  );
}

const FEATURES = [
  {
    icon: "✦",
    title: "Clean formulas",
    desc: "Every product is free from parabens, sulfates, and synthetic fragrances.",
  },
  {
    icon: "◈",
    title: "Dermatologist tested",
    desc: "Clinically validated for all skin types, including sensitive skin.",
  },
  {
    icon: "⬡",
    title: "Sustainable packaging",
    desc: "Recyclable materials and minimal packaging — beauty with a conscience.",
  },
  {
    icon: "◎",
    title: "Cruelty-free",
    desc: "Never tested on animals. Certified by Leaping Bunny.",
  },
];