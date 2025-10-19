import { motion, useScroll, useTransform } from 'framer-motion';
import '../styles/Hero.css';

const Hero = () => {
  // Parallax effect con scroll
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityParallax = useTransform(scrollY, [0, 300], [1, 0]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const floralVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="hero">
      {/* Gradient Overlay */}
      <div className="hero-overlay"></div>

      {/* La Parroquia Silhouette - Bottom Center with Parallax */}
      <motion.div
        className="hero-parroquia"
        variants={floralVariants}
        initial="hidden"
        animate="visible"
        style={{ y: yParallax, opacity: opacityParallax }}
      >
        <svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
          {/* Silueta simplificada de La Parroquia */}
          <g opacity="0.15" fill="var(--color-parroquia)">
            {/* Base de la iglesia */}
            <rect x="50" y="250" width="200" height="150" />

            {/* Torres laterales */}
            <rect x="40" y="200" width="40" height="200" />
            <rect x="220" y="200" width="40" height="200" />

            {/* Torre central principal */}
            <rect x="110" y="100" width="80" height="200" />

            {/* Aguja gótica característica */}
            <polygon points="150,20 130,100 170,100" />

            {/* Detalles góticos de la torre */}
            <polygon points="115,100 150,60 185,100" />
            <polygon points="120,130 150,110 180,130" />

            {/* Ventanas */}
            <rect x="130" y="160" width="15" height="30" fill="var(--color-cream)" opacity="0.3" />
            <rect x="155" y="160" width="15" height="30" fill="var(--color-cream)" opacity="0.3" />

            {/* Puerta principal */}
            <path d="M 135,350 Q 135,320 150,320 Q 165,320 165,350 Z" fill="var(--color-cream)" opacity="0.3" />
          </g>
        </svg>
      </motion.div>

      {/* Decorative Floral Elements */}
      <motion.div
        className="hero-floral hero-floral-top-left"
        variants={floralVariants}
        initial="hidden"
        animate="visible"
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,20 Q120,40 100,60 Q80,40 100,20 M100,60 Q90,80 70,90 M100,60 Q110,80 130,90"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                opacity="0.6"/>
          <circle cx="100" cy="60" r="4" fill="currentColor" opacity="0.8"/>
          <circle cx="70" cy="90" r="3" fill="currentColor" opacity="0.6"/>
          <circle cx="130" cy="90" r="3" fill="currentColor" opacity="0.6"/>
        </svg>
      </motion.div>

      <motion.div
        className="hero-floral hero-floral-top-right"
        variants={floralVariants}
        initial="hidden"
        animate="visible"
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,20 Q120,40 100,60 Q80,40 100,20 M100,60 Q90,80 70,90 M100,60 Q110,80 130,90"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                opacity="0.6"/>
          <circle cx="100" cy="60" r="4" fill="currentColor" opacity="0.8"/>
          <circle cx="70" cy="90" r="3" fill="currentColor" opacity="0.6"/>
          <circle cx="130" cy="90" r="3" fill="currentColor" opacity="0.6"/>
        </svg>
      </motion.div>

      {/* Hero Content */}
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-divider-top" variants={itemVariants}>
          <span className="divider-ornament">❦</span>
        </motion.div>

        <motion.p className="hero-subtitle" variants={itemVariants}>
          Nos casamos
        </motion.p>

        <motion.h1 className="hero-title" variants={itemVariants}>
          Michelle <span className="ampersand">&</span> Joshua
        </motion.h1>

        <motion.div className="hero-divider" variants={itemVariants}>
          <span className="divider-line"></span>
          <span className="divider-ornament">✦</span>
          <span className="divider-line"></span>
        </motion.div>

        <motion.p className="hero-date" variants={itemVariants}>
          <span className="date-day">29</span>
          <span className="date-separator">·</span>
          <span className="date-month">Noviembre</span>
          <span className="date-separator">·</span>
          <span className="date-year">2025</span>
        </motion.p>

        <motion.div className="hero-divider-bottom" variants={itemVariants}>
          <span className="divider-ornament">❦</span>
        </motion.div>

        <motion.p className="hero-location" variants={itemVariants}>
          San Miguel de Allende, México
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
