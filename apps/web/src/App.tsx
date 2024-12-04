import { Hero } from './components/Hero';
import { About } from './components/About';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <About />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;