import { GlowReport, ProductPick } from '@/lib/types';

function List({ items }: { items?: string[] }) {
  return <ul className="list">{(items || []).map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

function ProductList({ title, items }: { title: string; items?: ProductPick[] }) {
  if (!items?.length) return null;
  return (
    <div className="product-tier">
      <b>{title}</b>
      <List items={items.map(p => `${p.brand} ${p.name}${p.reason ? ` — ${p.reason}` : ''}`)} />
    </div>
  );
}

function QueryChips({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="chip-row">
      {items.slice(0, 6).map((item) => <span className="chip" key={item}>{item}</span>)}
    </div>
  );
}

export default function ReportView({ report }: { report: GlowReport }) {
  return (
    <div className="report-layout">
      <aside className="report-sidebar">
        <div className="card">
          <p className="mini-label">Blueprint for</p>
          <h2>{report.client_name || 'Client'}</h2>
          <div className="divider" />
          <p className="mini-label">Archetype</p>
          <h3>{report.archetype_summary.type}</h3>
          <p>{report.archetype_summary.vibe}</p>
          <div className="divider" />
          <p className="mini-label">Top 3 transformations</p>
          <List items={report.top_3_transformations} />
        </div>
      </aside>

      <div className="report-main">
        <section className="report-hero card">
          <div>
            <p className="eyebrow">Generated report</p>
            <h1>{report.archetype_summary.type}</h1>
            <p className="lead">{report.archetype_summary.vibe}</p>
          </div>
          <div className="report-stat">
            <span>Plan</span>
            <b>30 days</b>
          </div>
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">01</span>
            <h2>Celebrity Direction</h2>
          </div>
          <div className="card-grid two">
            {report.celebrity_matches.map((c, i) => (
              <div className="inner-card" key={i}>
                <h3>{c.name}</h3>
                <p>{c.reason}</p>
                <span className="chip">{c.style_reference_query}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">02</span>
            <h2>Face Diagnostic</h2>
          </div>
          <div className="card-grid two">
            <div className="inner-card">
              <h3>Advantages</h3>
              <List items={report.archetype_summary.key_advantages} />
            </div>
            <div className="inner-card">
              <h3>Limiters</h3>
              <List items={report.archetype_summary.key_limiters} />
            </div>
          </div>
          <div className="inner-card top-gap">
            <h3>Diagnostic notes</h3>
            <List items={report.archetype_summary.diagnostic_notes} />
          </div>
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">03</span>
            <h2>Hair System</h2>
          </div>
          <div className="highlight-box">
            <b>Barber script</b>
            <p>{report.hair_plan.cut.barber_script || `${report.hair_plan.cut.fade}; guards ${report.hair_plan.cut.guards}; top ${report.hair_plan.cut.top_length_inches} inches.`}</p>
          </div>
          <div className="card-grid two">
            <div className="inner-card">
              <h3>Cut specs</h3>
              <p><b>Fade:</b> {report.hair_plan.cut.fade}</p>
              <p><b>Guards:</b> {report.hair_plan.cut.guards}</p>
              <p><b>Top:</b> {report.hair_plan.cut.top_length_inches} inches</p>
              <p>{report.hair_plan.cut.notes}</p>
            </div>
            <div className="inner-card">
              <h3>Daily styling</h3>
              <List items={report.hair_plan.styling.steps} />
              <p><b>Finish:</b> {report.hair_plan.styling.finish}</p>
            </div>
          </div>
          <div className="inner-card top-gap">
            <h3>Products</h3>
            <ProductList title="Budget" items={report.hair_plan.products.budget} />
            <ProductList title="Mid" items={report.hair_plan.products.mid} />
            <ProductList title="Premium" items={report.hair_plan.products.premium} />
          </div>
          <div className="inner-card top-gap">
            <h3>DIY: {report.hair_plan.diy.name}</h3>
            <p><b>Ingredients:</b> {report.hair_plan.diy.ingredients.join(', ')}</p>
            <List items={report.hair_plan.diy.instructions} />
          </div>
          <QueryChips items={report.hair_plan.image_queries} />
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">04</span>
            <h2>Beard System</h2>
          </div>
          <div className="card-grid two">
            <div className="inner-card">
              <h3>Shape</h3>
              <p><b>Length:</b> {report.beard_plan.length_mm}</p>
              <p><b>Shape:</b> {report.beard_plan.shape}</p>
              <p><b>Neckline:</b> {report.beard_plan.neckline}</p>
            </div>
            <div className="inner-card">
              <h3>Maintenance</h3>
              <List items={report.beard_plan.maintenance} />
            </div>
          </div>
          <div className="inner-card top-gap">
            <h3>DIY: {report.beard_plan.diy.name}</h3>
            <p><b>Ingredients:</b> {report.beard_plan.diy.ingredients.join(', ')}</p>
            <List items={report.beard_plan.diy.instructions} />
          </div>
          <QueryChips items={report.beard_plan.image_queries} />
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">05</span>
            <h2>Skin & Self-Care</h2>
          </div>
          <div className="card-grid two">
            <div className="inner-card">
              <h3>Skin type</h3>
              <p>{report.skin_plan.skin_type}</p>
              <h3>Daily</h3>
              <List items={report.skin_plan.routine.daily} />
            </div>
            <div className="inner-card">
              <h3>Weekly</h3>
              <List items={report.skin_plan.routine.weekly} />
            </div>
          </div>
          <div className="inner-card top-gap">
            <h3>Product stack</h3>
            <ProductList title="Budget" items={report.skin_plan.products.budget} />
            <ProductList title="Mid" items={report.skin_plan.products.mid} />
            <ProductList title="Premium" items={report.skin_plan.products.premium} />
          </div>
          <div className="card-grid two top-gap">
            {report.skin_plan.diy.map((diy) => (
              <div className="inner-card" key={diy.name}>
                <h3>DIY: {diy.name}</h3>
                <p><b>Ingredients:</b> {diy.ingredients.join(', ')}</p>
                <List items={diy.instructions} />
              </div>
            ))}
          </div>
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">06</span>
            <h2>Style System</h2>
          </div>
          <div className="highlight-box">
            <b>Body structure assumption</b>
            <p>{report.style_system.body_structure_assumption}</p>
          </div>
          <div className="card-grid two">
            <div className="inner-card">
              <h3>Fit rules</h3>
              <List items={report.style_system.fit_rules} />
            </div>
            <div className="inner-card">
              <h3>Color palette</h3>
              <List items={report.style_system.color_palette} />
            </div>
          </div>
          <div className="inner-card top-gap">
            <h3>Capsule items</h3>
            <List items={report.style_system.core_items} />
          </div>
          <div className="card-grid three top-gap">
            <div className="inner-card"><h3>Casual</h3><List items={report.style_system.outfits.casual} /></div>
            <div className="inner-card"><h3>Dating</h3><List items={report.style_system.outfits.dating} /></div>
            <div className="inner-card"><h3>Professional</h3><List items={report.style_system.outfits.professional} /></div>
          </div>
          <div className="inner-card top-gap">
            <h3>Brands</h3>
            <div className="brand-columns">
              <div><b>Budget</b><List items={report.style_system.brands.budget} /></div>
              <div><b>Mid</b><List items={report.style_system.brands.mid} /></div>
              <div><b>Premium</b><List items={report.style_system.brands.premium} /></div>
            </div>
          </div>
          <QueryChips items={report.style_system.image_queries} />
        </section>

        <section className="card report-section">
          <div className="section-title">
            <span className="section-num">07</span>
            <h2>Presence & Execution</h2>
          </div>
          <div className="card-grid three">
            <div className="inner-card"><h3>Expressions</h3><List items={report.behavioral_optimization.expressions} /></div>
            <div className="inner-card"><h3>Posture</h3><List items={report.behavioral_optimization.posture} /></div>
            <div className="inner-card"><h3>Presence</h3><List items={report.behavioral_optimization.presence} /></div>
          </div>
          <div className="card-grid three top-gap">
            <div className="inner-card"><h3>Daily</h3><List items={report.execution_plan.daily} /></div>
            <div className="inner-card"><h3>Weekly</h3><List items={report.execution_plan.weekly} /></div>
            <div className="inner-card"><h3>Monthly</h3><List items={report.execution_plan.monthly} /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
