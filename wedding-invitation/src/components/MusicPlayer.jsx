import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/MusicPlayer.css';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Intentar reproducir automáticamente cuando el componente se monta
  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current && !hasStarted) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setHasStarted(true);
        } catch (error) {
          // Autoplay bloqueado por el navegador - el usuario debe interactuar primero
          console.log('Autoplay was prevented. User interaction required.');
        }
      }
    };

    playAudio();
  }, [hasStarted]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setHasStarted(true);
        } catch (error) {
          console.log('Playback failed:', error);
        }
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  return (
    <motion.div
      className="music-player"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <audio
        ref={audioRef}
        src="/music/canon_in_d.mp3"
        loop
        onEnded={() => setIsPlaying(false)}
      />

      <div className="music-player-controls">
        {/* Play/Pause Button */}
        <motion.button
          className="music-player-button"
          onClick={togglePlay}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          <span className="music-icon">{isPlaying ? '⏸' : '▶'}</span>
        </motion.button>

        {/* Volume Control */}
        <div className="music-player-volume">
          <motion.button
            className="music-player-volume-button"
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            <span className="music-icon">{isMuted || volume === 0 ? '🔇' : '🔊'}</span>
          </motion.button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="music-player-slider"
            aria-label="Control de volumen"
          />
        </div>
      </div>

      <div className="music-player-label">
        <span className="music-player-icon">♫</span>
        <span className="music-player-text">Canon en D</span>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
