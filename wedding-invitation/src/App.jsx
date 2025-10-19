import Hero from './components/Hero';
import Countdown from './components/Countdown';
import EventInfo from './components/EventInfo';
import Timeline from './components/Timeline';
import Gallery from './components/Gallery';
import GiftRegistry from './components/GiftRegistry';
import RSVP from './components/RSVP';
import MusicPlayer from './components/MusicPlayer';
import './App.css';

function App() {
  // Fecha de la boda - Ajustar según necesidad
  const weddingDate = "2025-11-29T16:30:00";

  return (
    <>
      <div className="app">
        <Hero />
        <Countdown weddingDate={weddingDate} />
        <EventInfo />
        <Timeline />
        <Gallery />
        <GiftRegistry />
        <RSVP />
      </div>
      <MusicPlayer />
    </>
  );
}

export default App;
