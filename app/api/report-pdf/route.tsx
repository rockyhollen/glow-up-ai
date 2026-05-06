import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { GlowReport } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 38, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  title: { fontSize: 28, marginBottom: 8, fontWeight: 700 },
  subtitle: { fontSize: 12, marginBottom: 22, color: '#555' },
  section: { marginBottom: 14, paddingBottom: 10, borderBottom: '1 solid #ddd' },
  h2: { fontSize: 16, marginBottom: 8, fontWeight: 700 },
  h3: { fontSize: 12, marginBottom: 5, fontWeight: 700 },
  p: { lineHeight: 1.5, marginBottom: 4 },
  li: { marginBottom: 3, lineHeight: 1.45 }
});

function Bullets({ items }: { items?: string[] }) {
  return <View>{(items || []).map((x, i) => <Text key={i} style={styles.li}>• {x}</Text>)}</View>;
}

function ReportDoc({ report }: { report: GlowReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Glow-Up Blueprint</Text>
        <Text style={styles.subtitle}>{report.client_name || 'Client'} · Personalized appearance optimization report</Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Archetype</Text>
          <Text style={styles.p}>{report.archetype_summary.type}</Text>
          <Text style={styles.p}>{report.archetype_summary.vibe}</Text>
          <Bullets items={report.archetype_summary.key_advantages} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Celebrity Look-Alikes</Text>
          {report.celebrity_matches.map((c, i) => <Text key={i} style={styles.p}>{i+1}. {c.name}: {c.reason}</Text>)}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Hair Plan</Text>
          <Text style={styles.p}>Cut: {report.hair_plan.cut.fade}; Guards: {report.hair_plan.cut.guards}; Top: {report.hair_plan.cut.top_length_inches} inches.</Text>
          <Text style={styles.p}>Barber script: {report.hair_plan.cut.barber_script}</Text>
          <Text style={styles.h3}>Styling</Text><Bullets items={report.hair_plan.styling.steps} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Beard Plan</Text>
          <Text style={styles.p}>Length: {report.beard_plan.length_mm} mm. Shape: {report.beard_plan.shape}</Text>
          <Text style={styles.p}>Neckline: {report.beard_plan.neckline}</Text>
          <Bullets items={report.beard_plan.maintenance} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Skin + DIY</Text>
          <Text style={styles.p}>Skin type: {report.skin_plan.skin_type}</Text>
          <Text style={styles.h3}>Daily</Text><Bullets items={report.skin_plan.routine.daily} />
          <Text style={styles.h3}>Weekly</Text><Bullets items={report.skin_plan.routine.weekly} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Style System</Text>
          <Text style={styles.h3}>Fit Rules</Text><Bullets items={report.style_system.fit_rules} />
          <Text style={styles.h3}>Outfits</Text><Bullets items={[...report.style_system.outfits.casual, ...report.style_system.outfits.dating, ...report.style_system.outfits.professional]} />
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Top 3 Transformations</Text>
          <Bullets items={report.top_3_transformations} />
        </View>

        <View>
          <Text style={styles.h2}>Execution Plan</Text>
          <Text style={styles.h3}>Daily</Text><Bullets items={report.execution_plan.daily} />
          <Text style={styles.h3}>Weekly</Text><Bullets items={report.execution_plan.weekly} />
          <Text style={styles.p}>Follow this consistently for 30 days for visible transformation.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: Request) {
  const { report } = await req.json() as { report: GlowReport };
  const blob = await pdf(<ReportDoc report={report} />).toBlob();
  return new Response(blob, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="glow-up-blueprint.pdf"'
    }
  });
}
