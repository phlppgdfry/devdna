import { redirect } from 'next/navigation';

export default function Home() {
  async function search(formData: FormData) {
    'use server';
    const username = (formData.get('username') as string)?.trim();
    if (username) redirect(`/${username}`);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🧬</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00ff9f', letterSpacing: '0.1em' }}>DEV DNA</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1rem' }}>
          Uncover your GitHub genetic code
        </p>
      </div>

      <form action={search} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '420px' }}>
        <input
          name="username"
          placeholder="github username"
          autoFocus
          required
          style={{
            flex: 1,
            background: '#111',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            color: '#e2e8f0',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#00ff9f',
            color: '#090909',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.25rem',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          ANALYZE →
        </button>
      </form>

      <div style={{ color: '#334155', fontSize: '0.8rem', textAlign: 'center' }}>
        <p>or try in your terminal:</p>
        <code style={{ color: '#00ff9f', fontSize: '0.85rem' }}>npx devdna KippieG</code>
      </div>

      <footer style={{ position: 'absolute', bottom: '1.5rem', color: '#1e293b', fontSize: '0.75rem' }}>
        devdna · open source · by Philippe Godfroy
      </footer>
    </main>
  );
}
