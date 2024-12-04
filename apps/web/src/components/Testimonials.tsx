export function Testimonials() {
  const testimonials = [
    {
      quote: "I roasted my DAO co-founder, and it was worth every token. 🔥😂",
      author: "near.***"
    },
    {
      quote: "These burns are hotter than my gas fees. 💸💀",
      author: "wallet.***"
    },
    {
      quote: "Best way to get back at my ex-validator. Pure comedy gold! 🎭",
      author: "stake.***"
    }
  ];

  return (
    <div className="bg-black py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-16">Community Vibes</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gradient-to-b from-orange-900/50 to-transparent p-6 rounded-2xl">
              <p className="text-lg text-orange-200 mb-4">{testimonial.quote}</p>
              <p className="text-sm text-orange-500 font-mono">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}