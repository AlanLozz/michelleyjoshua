import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';
import '../styles/EventInfo.css';

const EventInfo = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <section className="event-info">
      <motion.h2
        className="event-title"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Detalles del Evento
      </motion.h2>

      <div className="event-details">
        <motion.div
          className="event-card"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
        >
          <FaCalendarAlt className="event-icon" />
          <h3>Fecha</h3>
          <p>Sábado, 29 de Noviembre 2025</p>
        </motion.div>

        <motion.div
          className="event-card"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
        >
          <FaClock className="event-icon" />
          <h3>Hora</h3>
          <p>4:30 PM</p>
        </motion.div>

        <motion.div
          className="event-card"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05 }}
        >
          <FaMapMarkerAlt className="event-icon" />
          <h3>Lugar</h3>
          <p>Hacienda Los Robles</p>
          <p className="event-address">Calle Principal 123, Ciudad</p>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="event-map-link"
          >
            Ver en Maps
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default EventInfo;
