import { motion } from 'framer-motion';
import '../styles/PapelPicado.css';

const PapelPicado = () => {
  const colors = [
    'var(--color-primary)',
    'var(--color-parroquia)',
    'var(--color-mexican-pink)',
    'var(--color-secondary)',
    'var(--color-accent)',
    'var(--color-gold)'
  ];

  const banners = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    delay: i * 0.1
  }));

  const bannerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (delay) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay,
        duration: 0.8,
        ease: 'easeOut'
      }
    }),
    float: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="papel-picado-container">
      <svg
        className="papel-picado-svg"
        viewBox="0 0 800 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Patrón de papel picado */}
          <clipPath id="papel-pattern">
            <path d="M 0,0 L 80,0 L 80,80 L 60,100 L 40,80 L 20,100 L 0,80 Z" />
          </clipPath>

          {/* Diseños de flores y corazones dentro del papel */}
          <g id="flower">
            <circle cx="40" cy="30" r="8" />
            <circle cx="30" cy="40" r="6" />
            <circle cx="50" cy="40" r="6" />
            <circle cx="40" cy="50" r="6" />
            <circle cx="40" cy="40" r="4" />
          </g>

          <g id="heart">
            <path d="M 40,55 C 40,45 28,40 22,45 C 18,48 18,55 22,60 L 40,75 L 58,60 C 62,55 62,48 58,45 C 52,40 40,45 40,55 Z" />
          </g>
        </defs>

        {/* Cuerda superior */}
        <line
          x1="0"
          y1="10"
          x2="800"
          y2="10"
          stroke="var(--color-dark)"
          strokeWidth="2"
          opacity="0.3"
        />

        {/* Banderines de papel picado */}
        {banners.map((banner, index) => (
          <motion.g
            key={banner.id}
            custom={banner.delay}
            variants={bannerVariants}
            initial="hidden"
            animate={['visible', 'float']}
            style={{ transformOrigin: `${index * 100 + 50}px 10px` }}
          >
            {/* Línea de conexión a la cuerda */}
            <line
              x1={index * 100 + 40}
              y1="10"
              x2={index * 100 + 40}
              y2="15"
              stroke="var(--color-dark)"
              strokeWidth="1"
              opacity="0.4"
            />

            {/* Banderín con clip path */}
            <g transform={`translate(${index * 100}, 15)`} clipPath="url(#papel-pattern)">
              <rect
                width="80"
                height="100"
                fill={banner.color}
                opacity="0.9"
              />

              {/* Decoración interna - alternar entre flores y corazones */}
              <use
                href={index % 2 === 0 ? '#flower' : '#heart'}
                fill="rgba(255, 255, 255, 0.4)"
              />

              {/* Cortes decorativos */}
              <circle cx="20" cy="60" r="4" fill="rgba(255, 255, 255, 0.3)" />
              <circle cx="60" cy="60" r="4" fill="rgba(255, 255, 255, 0.3)" />
              <circle cx="40" cy="70" r="3" fill="rgba(255, 255, 255, 0.3)" />
            </g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default PapelPicado;
