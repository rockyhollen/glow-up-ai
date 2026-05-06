'use client';

import { useMemo, useState } from 'react';
import { GlowReport } from '@/lib/types';
import ReportView from '@/components/ReportView';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GlowReport | null>(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(() => files.slice(0, 5).map((file) => URL.createObjectURL(file)), [files]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new FormData(e.currentTarget);
      const selected = form.getAll('photos') as File[];
      const images = await Promise.all(selected.filter(f => f.size > 0).slice(0, 5).map(readFileAsDataUrl));
      const params = new URLSearchParams(window.location.search);

      const payload = {
        sessionId: params.get('session_id'),
        name: String(form.get('name') || ''),
        age: String(form.get('age') || ''),
        goal: String(form.get('goal') || ''),
        lifestyle: String(form.get('lifestyle') || ''),
        stylePreference: String(form.get('stylePreference') || ''),
        budget: String(form.get('budget') || ''),
        maintenance: String(form.get('maintenance') || ''),
        images
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!report) return;
    const res = await fetch('/api/report-pdf', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ report })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glow-up-blueprint.pdf';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (report) {
    return (
      <main className="container page-pad">
        <nav className="nav">
          <a href="/" className="brand"><span className="brand-mark">G</span><span>Glow-Up for Men</span></a>
          <button className="button button-primary button-small" onClick={downloadPdf}>Download PDF</button>
        </nav>
        <ReportView report={report} />
      </main>
    );
  }

  return (
    <main className="intake-page">
      <nav className="nav container">
        <a href="/" className="brand"><span className="brand-mark">G</span><span>Glow-Up for Men</span></a>
        <div className="badge">Secure intake</div>
      </nav>

      <section className="container intake-grid">
        <div className="intake-copy">
          <div className="eyebrow">Client intake</div>
          <h1>Create your Glow-Up Blueprint.</h1>
          <p className="lead">
            Upload clear photos and answer a few context questions. The system will generate your
            personalized diagnostic, grooming plan, style system, products, DIY recipes, and PDF.
          </p>
          <div className="tip-card">
            <h3>Best photo set</h3>
            <ul className="list">
              <li>Front-facing face photo in natural light</li>
              <li>Side-angle face photo</li>
              <li>Hair visible, not covered by a hat</li>
              <li>One full-body photo for fit and styling guidance</li>
            </ul>
          </div>
        </div>

        <form className="form-card" onSubmit={submit}>
          <div className="form-row two">
            <label>Name<input className="input" name="name" required placeholder="Alex" /></label>
            <label>Age<input className="input" name="age" type="number" min="13" required placeholder="28" /></label>
          </div>

          <label>Primary goal
            <select className="input" name="goal" defaultValue="Both">
              <option>Dating / social</option>
              <option>Professional</option>
              <option>Both</option>
            </select>
          </label>

          <div className="form-row two">
            <label>Budget preference
              <select className="input" name="budget" defaultValue="Balanced">
                <option>Budget</option>
                <option>Balanced</option>
                <option>Premium</option>
              </select>
            </label>
            <label>Maintenance level
              <select className="input" name="maintenance" defaultValue="Medium">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <label>Lifestyle
            <textarea className="input" name="lifestyle" rows={3} placeholder="Corporate, fitness, nightlife, student, creative, low-maintenance, etc." />
          </label>

          <label>Style preference
            <textarea className="input" name="stylePreference" rows={3} placeholder="Minimal, rugged, polished, streetwear, business casual, not sure, etc." />
          </label>

          <label>Photos
            <input
              className="input"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(e) => setFiles(Array.from(e.currentTarget.files || []))}
            />
          </label>

          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((src, i) => <img src={src} alt={`Upload preview ${i + 1}`} key={src} />)}
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <button className="button button-primary full" type="submit" disabled={loading}>
            {loading ? 'Generating your blueprint...' : 'Generate Blueprint'}
          </button>

          {loading && (
            <div className="loading-panel">
              <span className="spinner" />
              <div>
                <b>Analyzing photos and building report</b>
                <p>Creating diagnostic, style system, routines, product stack, and PDF data.</p>
              </div>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
