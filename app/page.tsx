import Link from 'next/link';

const included = [
  'Face-shape and feature diagnostic',
  'Top celebrity look-alike direction',
  'Barber-ready haircut instructions',
  'Beard length, neckline, and maintenance',
  'Skin routine: DIY, budget, mid, premium',
  'Capsule wardrobe and outfit formulas',
  'Brand recommendations and visual search cues',
  'Downloadable PDF report'
];

const steps = [
  {
    k: '01',
    title: 'Upload your photos',
    body: 'Submit 3–5 clear photos so the system can analyze face shape, hair, skin, facial hair, and visible frame.'
  },
  {
    k: '02',
    title: 'Get your diagnostic',
    body: 'The AI turns your features into a precise appearance strategy instead of generic grooming advice.'
  },
  {
    k: '03',
    title: 'Execute with confidence',
    body: 'Walk away with exact barber instructions, routines, product tiers, outfits, and a PDF you can save.'
  }
];

const outcomes = [
  ['Hair', 'Clipper guards, top length, texture, product stack, and DIY alternatives.'],
  ['Skin', 'Simple routine matched to visible skin needs with practical product tiers.'],
  ['Style', 'Capsule wardrobe, colors, fits, and outfits based on your structure.'],
  ['Presence', 'Expression, posture, and vibe cues to make the look work in real life.']
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="brand-mark">G</span>
            <span>Glow-Up for Men</span>
          </Link>
          <div className="nav-actions">
            <a href="#example" className="nav-link">Sample</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link className="button button-small button-ghost" href="/upload">Try demo</Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Personalized AI appearance blueprint</div>
            <h1>Stop guessing what makes you look better.</h1>
            <p className="lead">
              Upload your photos and get a premium men’s glow-up report built around your actual
              face, hair, skin, beard potential, body structure, lifestyle, and goals.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/api/checkout">Get My Blueprint</Link>
              <Link className="button button-secondary" href="/upload">Run local test</Link>
            </div>
            <div className="trust-row">
              <span>PDF-ready</span>
              <span>Barber-ready</span>
              <span>Product-ready</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="phone-frame">
              <div className="report-mini-top">
                <div>
                  <p className="mini-label">Your Archetype</p>
                  <h3>Structured, masculine, composed</h3>
                </div>
                <span className="score">92%</span>
              </div>
              <div className="mini-diagnostic">
                <span>Jawline</span><b>High impact</b>
                <span>Hair</span><b>Needs texture</b>
                <span>Beard</span><b>4–6mm ideal</b>
                <span>Style</span><b>Dark structured fits</b>
              </div>
              <div className="mini-card gold">
                Barber script generated: low-mid fade, #0.5 to #3 blend, 3 inches textured top.
              </div>
              <div className="mini-card">
                Product stack: DIY sea salt spray + matte clay + aloe/jojoba skin routine.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container logo-strip">
        <span>Built for men who want clarity</span>
        <span>Dating</span>
        <span>Professional</span>
        <span>Social</span>
        <span>Low-maintenance</span>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div className="eyebrow">What customers receive</div>
          <h2>A complete appearance operating system.</h2>
        </div>
        <div className="feature-grid">
          {included.map((item) => (
            <div className="feature-card" key={item}>
              <span className="check">✓</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="split">
          <div>
            <div className="eyebrow">How it works</div>
            <h2>From photos to execution plan in one flow.</h2>
            <p>
              The product is designed to feel like a premium consultant report: direct, specific,
              visual, and simple enough to act on immediately.
            </p>
          </div>
          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.k}>
                <span>{step.k}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="example" className="container section">
        <div className="section-heading">
          <div className="eyebrow">Sample output</div>
          <h2>Specific enough to hand to your barber, stylist, or future self.</h2>
        </div>
        <div className="outcome-grid">
          {outcomes.map(([title, body]) => (
            <div className="outcome-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="container section">
        <div className="pricing-card">
          <div>
            <div className="eyebrow">Launch offer</div>
            <h2>Personal Glow-Up Blueprint</h2>
            <p>
              One personalized report with visual diagnostic, grooming, style, product, DIY, and
              PDF export.
            </p>
          </div>
          <div className="price-panel">
            <div className="price">$19</div>
            <p>Recommended launch price</p>
            <Link className="button button-primary full" href="/api/checkout">Start my report</Link>
            <Link className="button button-ghost full" href="/upload">Test without payment</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span>Glow-Up for Men</span>
          <span>Personalized reports. Practical execution.</span>
        </div>
      </footer>
    </main>
  );
}
