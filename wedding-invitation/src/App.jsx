import Hero from './components/Hero';
import Countdown from './components/Countdown';
import EventInfo from './components/EventInfo';
import Gallery from './components/Gallery';
import RSVP from './components/RSVP';
import './App.css';

function App() {
  // Fecha de la boda - Ajustar según necesidad
  const weddingDate = "2025-11-29T16:30:00";

  return (
    <div className="app">
      <Hero />
      <Countdown weddingDate={weddingDate} />
      <EventInfo />
      <Gallery />
      <RSVP />
    </div>
  );
}

export default App;
