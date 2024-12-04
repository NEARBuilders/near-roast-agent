import { Flame, Zap, TrendingUp } from 'lucide-react';

export function About() {
  return (
    <div className="bg-black text-white py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">What is $ROAST?</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-orange-900/50 to-transparent">
            <Flame className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Savage Roasts</h3>
            <p className="text-orange-200">From cringe-core to DAO drama, no wallet is safe from the 🔥. If you've got the tokens, we've got the roasts.</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-orange-900/50 to-transparent">
            <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Token Burns</h3>
            <p className="text-orange-200">Every roast burns tokens, making $ROAST scarcer and spicier over time. More roasts = fewer tokens = 🔥 market.</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-orange-900/50 to-transparent">
            <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Community Driven</h3>
            <p className="text-orange-200">Built for the NEAR degenerates who laugh at their own trades. Join the most savage community in crypto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}