import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Gallery.css';

const Gallery = () => {
  // Placeholder para imágenes - el usuario agregará las suyas
  const photos = [
    { id: 1, src: '/images/image_1.jpg', alt: 'Foto 1' },
    { id: 2, src: '/images/image_2.jpg', alt: 'Foto 2' },
    // { id: 3, src: 'https://via.placeholder.com/800x600?text=Foto+3', alt: 'Foto 3' },
    // { id: 4, src: 'https://via.placeholder.com/800x600?text=Foto+4', alt: 'Foto 4' },
    // { id: 5, src: 'https://via.placeholder.com/800x600?text=Foto+5', alt: 'Foto 5' },
    // { id: 6, src: 'https://via.placeholder.com/800x600?text=Foto+6', alt: 'Foto 6' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex < 0) newIndex = photos.length - 1;
      if (newIndex >= photos.length) newIndex = 0;
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <section className="gallery">
      <motion.h2
        className="gallery-title"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Nuestra Historia
      </motion.h2>

      <div className="carousel-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            className="carousel-slide"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            <div className="carousel-image-wrapper">
              <img
                src={photos[currentIndex].src}
                alt={photos[currentIndex].alt}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Botones de navegación */}
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => paginate(-1)}
          aria-label="Foto anterior"
        >
          <span className="carousel-icon">‹</span>
        </button>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => paginate(1)}
          aria-label="Siguiente foto"
        >
          <span className="carousel-icon">›</span>
        </button>

        {/* Indicadores (dots) */}
        <div className="carousel-dots">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a foto ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
