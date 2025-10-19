import { motion } from 'framer-motion';
import '../styles/AzulejosPattern.css';

const AzulejosPattern = ({ variant = 'border' }) => {
  // Diferentes patrones de azulejos
  const tileVariants = {
    pattern1: {
      colors: ['var(--color-primary)', 'var(--color-parroquia)', 'var(--color-gold)'],
      paths: [
        'M 25,25 L 50,0 L 75,25 L 50,50 Z',
        'M 0,25 L 25,0 L 25,50 Z',
        'M 75,25 L 100,0 L 100,50 Z',
        'M 25,75 L 50,50 L 75,75 L 50,100 Z'
      ]
    },
    pattern2: {
      colors: ['var(--color-secondary)', 'var(--color-accent)', 'var(--color-mexican-pink)'],
      paths: [
        'M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0',
        'M 50,10 L 90,50 L 50,90 L 10,50 Z',
        'M 30,30 L 70,30 L 70,70 L 30,70 Z'
      ]
    }
  };

  const pattern = tileVariants[Math.random() > 0.5 ? 'pattern1' : 'pattern2'];

  const tileAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: 'easeOut'
      }
    })
  };

  // Renderizar diferentes estilos según variant
  if (variant === 'border') {
    return (
      <div className="azulejos-border">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="azulejo-tile"
            custom={i}
            variants={tileAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`tile-pattern-${i}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="var(--color-cream)" />
                  {pattern.paths.map((path, idx) => (
                    <path
                      key={idx}
                      d={path}
                      fill={pattern.colors[idx % pattern.colors.length]}
                      opacity="0.8"
                    />
                  ))}
                </pattern>
              </defs>
              <rect width="100" height="100" fill={`url(#tile-pattern-${i})`} />

              {/* Borde decorativo */}
              <rect
                x="2"
                y="2"
                width="96"
                height="96"
                fill="none"
                stroke="var(--color-dark)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        ))}
      </div>
    );
  }

  // Variante de esquina
  return (
    <div className="azulejos-corner">
      <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="corner-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="var(--color-cream)" />
            <circle cx="25" cy="25" r="15" fill="var(--color-primary)" opacity="0.7" />
            <circle cx="25" cy="25" r="8" fill="var(--color-parroquia)" opacity="0.8" />
            <path
              d="M 10,25 L 25,10 L 40,25 L 25,40 Z"
              fill="var(--color-gold)"
              opacity="0.6"
            />
          </pattern>
        </defs>

        {/* Arreglo 3x3 de azulejos */}
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <rect
                key={i}
                x={col * 50}
                y={row * 50}
                width="50"
                height="50"
                fill="url(#corner-pattern)"
              />
            );
          })}
        </g>

        {/* Bordes */}
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <rect
              key={`border-${i}`}
              x={col * 50 + 1}
              y={row * 50 + 1}
              width="48"
              height="48"
              fill="none"
              stroke="var(--color-dark)"
              strokeWidth="0.5"
              opacity="0.2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AzulejosPattern;
