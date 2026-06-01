import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DevDNA — Uncover your GitHub DNA',
  description: 'Analyze any GitHub profile and generate a beautiful developer DNA report.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: #090909;
            color: #e2e8f0;
            font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
            min-height: 100vh;
          }
          a { color: inherit; text-decoration: none; }
          ::selection { background: #00ff9f33; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
