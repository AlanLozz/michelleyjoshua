import { motion } from 'framer-motion';
import '../styles/Hero.css';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="hero">
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-title" variants={itemVariants}>
          Michelle & Joshua
        </motion.h1>
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Nos casamos
        </motion.p>
        <motion.p className="hero-date" variants={itemVariants}>
          29/11/2025
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;
