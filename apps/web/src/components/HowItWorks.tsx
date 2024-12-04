import { Wallet, MessageSquare, Flame } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Wallet className="w-12 h-12" />,
      title: "Buy $ROAST Tokens",
      description: "Use your NEAR wallet to swap for $ROAST on a DEX like Ref Finance."
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "Roast a Wallet",
      description: "Enter any NEAR account you want roasted and pay with $ROAST tokens."
    },
    {
      icon: <Flame className="w-12 h-12" />,
      title: "Burn & Laugh",
      description: "Watch the roast burn both egos and tokens! Less $ROAST in circulation means your tokens are even more 🔥."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-orange-900 to-black py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-16">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 right-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent transform translate-x-1/2" />
              )}
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500 text-white mb-6 mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-orange-200">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}