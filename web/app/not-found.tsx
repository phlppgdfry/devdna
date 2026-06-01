import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
      <div style={{ fontFamily: 'inherit', textAlign: 'center' }}>
        <div style={{ color: '#1e293b', fontSize: '4rem', fontWeight: 700 }}>404</div>
        <h1 style={{ color: '#334155', fontSize: '1.1rem', marginTop: '0.25rem' }}>User not found</h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Make sure the GitHub username is correct and the profile is public.
        </p>
      </div>
      <Link
        href="/"
        style={{
          background: '#00ff9f',
          color: '#090909',
          borderRadius: '6px',
          padding: '0.6rem 1.25rem',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: '0.85rem',
          textDecoration: 'none',
        }}
      >
        ← Try another username
      </Link>
      <code style={{ color: '#1e293b', fontSize: '0.8rem' }}>npx devdna &lt;username&gt;</code>
    </main>
  );
}
