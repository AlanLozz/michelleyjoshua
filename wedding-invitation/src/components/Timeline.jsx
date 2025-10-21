import { motion } from 'framer-motion';
import { FaUsers, FaChurch, FaGlassCheers, FaUtensils, FaMusic } from 'react-icons/fa';
import '../styles/Timeline.css';

const Timeline = () => {
  const events = [
    {
      id: 1,
      time: '4:30 PM',
      title: 'Llegada de Invitados',
      description: 'Recepción y bienvenida',
      icon: FaUsers,
      color: 'var(--color-sage)'
    },
    {
      id: 2,
      time: '5:00 PM',
      title: 'Ceremonia',
      description: 'Nos unimos en matrimonio',
      icon: FaChurch,
      color: 'var(--color-primary)'
    },
    {
      id: 3,
      time: '6:00 PM',
      title: 'Cóctel de Bienvenida',
      description: 'Bebidas y aperitivos',
      icon: FaGlassCheers,
      color: 'var(--color-secondary)'
    },
    {
      id: 4,
      time: '7:00 PM',
      title: 'Cena',
      description: 'Banquete y brindis',
      icon: FaUtensils,
      color: 'var(--color-parroquia)'
    },
    {
      id: 5,
      time: '8:00 PM',
      title: 'Baile y Fiesta',
      description: '¡A bailar toda la noche!',
      icon: FaMusic,
      color: 'var(--color-gold)'
    }
  ];

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  };

  return (
    <section className="timeline">
      <motion.div
        className="timeline-content"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="timeline-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Itinerario del Día
        </motion.h2>

        <motion.p
          className="timeline-subtitle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Agenda para celebrar juntos
        </motion.p>

        <div className="timeline-line"></div>

        <div className="timeline-events">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className="timeline-item"
              custom={index}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="timeline-marker" style={{ backgroundColor: event.color }}>
                <event.icon className="timeline-icon" />
              </div>

              <div className="timeline-card">
                <span className="timeline-time">{event.time}</span>
                <h3 className="timeline-event-title">{event.title}</h3>
                <p className="timeline-description">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Timeline;
