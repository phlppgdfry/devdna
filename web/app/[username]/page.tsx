import { getDNA } from '@/lib/github';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const LANG_COLORS: Record<string, string> = {
  Swift: '#f05138',
  Kotlin: '#7f52ff',
  Dart: '#00b4ab',
  JavaScript: '#f0db4f',
  TypeScript: '#3178c6',
  Python: '#3572a5',
  Go: '#00add8',
  Rust: '#dea584',
  Ruby: '#cc342d',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  CSS: '#563d7c',
  HTML: '#e34c26',
};

function getLangColor(lang: string) {
  return LANG_COLORS[lang] || '#64748b';
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return {
    title: `${params.username} — DevDNA`,
    description: `GitHub DNA report for ${params.username}`,
    openGraph: {
      title: `${params.username} · DevDNA`,
      description: `Discover ${params.username}'s GitHub DNA — languages, commit patterns, and developer identity.`,
    },
  };
}

function BarRow({ label, pct, color, sub }: { label: string; pct: number; color: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
      <span style={{ color: '#64748b', width: '110px', fontSize: '0.8rem', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#1e293b', borderRadius: '2px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ color: '#e2e8f0', fontSize: '0.8rem', width: '36px', textAlign: 'right' }}>{pct}%</span>
      {sub && <span style={{ color: '#334155', fontSize: '0.75rem', width: '60px' }}>{sub}</span>}
    </div>
  );
}

function HeatMap({ hours, peakHour }: { hours: number[]; peakHour: number }) {
  const max = Math.max(...hours, 1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px' }}>
      {hours.map((count, h) => {
        const intensity = count / max;
        const isPeak = h === peakHour;
        return (
          <div
            key={h}
            title={`${h}:00 — ${count} pushes`}
            style={{
              height: '20px',
              background: isPeak
                ? `rgba(255, 215, 0, ${0.2 + intensity * 0.8})`
                : `rgba(0, 255, 159, ${0.05 + intensity * 0.7})`,
              borderRadius: '2px',
              border: isPeak ? '1px solid #ffd70066' : 'none',
            }}
          />
        );
      })}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.65rem', marginTop: '4px' }}>
        <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  padding: '1.25rem',
};

const sectionTitle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  marginBottom: '1rem',
  textTransform: 'uppercase' as const,
};

export default async function ProfilePage({ params }: { params: { username: string } }) {
  let dna;
  try {
    dna = await getDNA(params.username);
  } catch {
    notFound();
  }

  const { user, languages, peakHour, hours, totalStars, topRepos, traits, commitStyle, topTopics } = dna;

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}>
          <img
            src={user.avatar_url}
            alt={user.login}
            width={72}
            height={72}
            style={{ borderRadius: '50%', border: '2px solid #1e293b' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0' }}>{user.name || user.login}</h1>
              <a href={user.html_url} target="_blank" rel="noopener" style={{ color: '#64748b', fontSize: '0.85rem' }}>@{user.login}</a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {traits.map(t => (
                <span key={t} style={{ background: '#00ff9f18', color: '#00ff9f', border: '1px solid #00ff9f33', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem' }}>
                  {t}
                </span>
              ))}
            </div>
            {user.bio && <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{user.bio}</p>}
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: '★ Stars', value: totalStars.toLocaleString() },
            { label: '⑁ Repos', value: user.public_repos },
            { label: '⌚ Peaked', value: `${peakHour}:00` },
            { label: '◉ Followers', value: user.followers.toLocaleString() },
          ].map(s => (
            <div key={s.label} style={{ ...card, textAlign: 'center' }}>
              <div style={{ color: '#00ff9f', fontSize: '1.3rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* LANGUAGES + TIMING */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={card}>
            <p style={sectionTitle}>Languages</p>
            {languages.map(({ lang, pct, repos }) => (
              <BarRow key={lang} label={lang} pct={pct} color={getLangColor(lang)} sub={`${repos}r`} />
            ))}
          </div>

          <div style={card}>
            <p style={sectionTitle}>Commit Rhythm</p>
            <HeatMap hours={hours} peakHour={peakHour} />
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
              Peak: <span style={{ color: '#ffd700' }}>{peakHour}:00</span> · Style: <span style={{ color: '#e2e8f0' }}>{commitStyle}</span>
            </p>
          </div>
        </div>

        {/* TOP REPOS */}
        {topRepos.length > 0 && (
          <div style={card}>
            <p style={sectionTitle}>Top Repos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {topRepos.map(repo => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener"
                  style={{ background: '#090909', border: '1px solid #1e293b', borderRadius: '6px', padding: '0.875rem', display: 'block', transition: 'border-color 0.2s' }}
                >
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{repo.name}</div>
                  {repo.description && (
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {repo.description.slice(0, 80)}{repo.description.length > 80 ? '...' : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#475569' }}>
                    <span>★ {repo.stargazers_count}</span>
                    {repo.language && <span style={{ color: getLangColor(repo.language) }}>{repo.language}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* TOPICS */}
        {topTopics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topTopics.map(t => (
              <span key={t} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', color: '#64748b' }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.75rem', paddingTop: '1rem' }}>
          <a href="/" style={{ color: '#334155' }}>🧬 devdna</a>
          {' · '}
          <code style={{ color: '#334155' }}>npx devdna {user.login}</code>
        </div>
      </div>
    </main>
  );
}
