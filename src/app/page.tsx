import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Stringy-Thingy</h1>
      <p>Homepage is working!</p>
      <Link href="/test">Test Page</Link> | 
      <Link href="/dashboard">Dashboard</Link> | 
      <Link href="/admin">Admin</Link>
    </div>
  );
}
