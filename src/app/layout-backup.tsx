export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>Stringy-Thingy</h1>
          <nav>
            <a href="/">Home</a> | 
            <a href="/test">Test</a> | 
            <a href="/dashboard">Dashboard</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
