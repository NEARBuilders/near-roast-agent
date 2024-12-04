import { MessageCircle, TwitterIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-orange-900/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">NEAR Roasts</h3>
            <p className="text-orange-200">Built for the NEAR degenerates who laugh at their own trades.</p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </a>
            <a href="https://x.com/near_roasts" target="_blank" className="text-orange-500 hover:text-orange-400 transition-colors">
              <TwitterIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}