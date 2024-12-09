import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-black to-orange-900 flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      
      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 2 + 1}rem`
            }}
          >
            {['🔥', '😂', '💀', '📉'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Main content card */}
      <div className="relative z-20 bg-black/60 backdrop-blur-sm p-8 rounded-2xl border border-orange-500/20 shadow-2xl max-w-2xl w-full mx-4">
        <h1 className="text-4xl font-bold text-orange-500 mb-6">NEAR Roast Agent</h1>
        <ul className="space-y-4">
          <li className="transition-all hover:translate-x-2">
            <Link href="/.well-known/ai-plugin.json" className="text-orange-200 hover:text-orange-400">
              OpenAPI Spec
            </Link>
          </li>
          <li className="transition-all hover:translate-x-2">
            <Link href="/api/swagger" className="text-orange-200 hover:text-orange-400">
              Swagger
            </Link>
          </li>
          <li className="transition-all hover:translate-x-2">
            <a
              href="https://github.com/nearbuilders/near-roast-agent"
              target="_blank"
              rel="noreferrer"
              className="text-orange-200 hover:text-orange-400"
            >
              Source Code
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
