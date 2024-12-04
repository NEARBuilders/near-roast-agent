import { Flame, ArrowRight, Wallet } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-orange-900 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      
      <div className="relative z-20 max-w-4xl mx-auto text-center px-4">
        <div className="animate-float inline-block mb-6">
          <Flame className="w-20 h-20 text-orange-500 animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          <span className="inline-block">🔥 Roast Wallets.</span>
          <br />
          <span className="inline-block">Burn Tokens.</span>
          <br />
          <span className="inline-block text-orange-500">Ignite Chaos.</span>
          <span className="inline-block ml-2">🔥</span>
        </h1>
        
        <p className="text-xl text-orange-200 mb-8 max-w-2xl mx-auto">
          Your ticket to unleashing savage, over-the-top roasts on the NEAR blockchain. Every roast burns tokens, making $ROAST even spicier.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="relative z-30 group bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 inline-flex items-center gap-2">
            Roast Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="relative z-30 group bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-xl font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 inline-flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Buy $ROAST
          </button>
        </div>
      </div>
      
      {/* Floating emojis with lower z-index */}
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
    </div>
  );
}