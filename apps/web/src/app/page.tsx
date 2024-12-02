import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col p-2">
      <h1 className="text-3xl font-bold">NEAR Roast Agent</h1>
      <ul>
        <li>
          <Link href="/.well-known/ai-plugin.json">OpenAPI Spec</Link>
        </li>
        <li>
          <Link href="/api/swagger">Swagger</Link>
        </li>
        <li>
          <a
            href="https://github.com/nearbuilders/near-roast-agent"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </li>
      </ul>
    </main>
  );
}
