import { motion } from 'framer-motion';
import { FaGift, FaStore, FaHeart, FaEnvelope } from 'react-icons/fa';
import '../styles/GiftRegistry.css';

const GiftRegistry = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  };

  const registries = [
    {
      id: 1,
      icon: FaStore,
      name: 'Liverpool',
      description: 'Mesa de regalos',
      link: 'https://mesaderegalos.liverpool.com.mx',
      color: 'var(--color-primary)'
    },
    {
      id: 2,
      icon: FaGift,
      name: 'Amazon',
      description: 'Lista de deseos',
      link: 'https://www.amazon.com.mx/wedding/registry',
      color: 'var(--color-secondary)'
    },
    {
      id: 3,
      icon: FaEnvelope,
      name: 'Lluvia de Sobres',
      description: 'Contribución monetaria',
      type: 'cash',
      color: 'var(--color-gold)'
    }
  ];

  return (
    <section className="gift-registry">
      <motion.div
        className="gift-registry-content"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <FaHeart className="gift-registry-icon" />

        <motion.h2
          className="gift-registry-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Mesa de Regalos
        </motion.h2>

        <motion.p
          className="gift-registry-description"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Tu presencia es nuestro mejor regalo. Si deseas hacernos un obsequio,
          hemos preparado estas opciones para ti.
        </motion.p>

        <div className="gift-registry-cards">
          {registries.map((registry, index) => (
            <motion.div
              key={registry.id}
              className="gift-card"
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <registry.icon
                className="gift-card-icon"
                style={{ color: registry.color }}
              />

              <h3 className="gift-card-name">{registry.name}</h3>
              <p className="gift-card-description">{registry.description}</p>

              {registry.type === 'cash' ? (
                <button
                  className="gift-card-button"
                  onClick={() => {
                    // Aquí se puede abrir un modal con información bancaria
                    alert('Información bancaria:\n\nBanco: BBVA\nCuenta: 0123456789\nCLABE: 012345678901234567\nBeneficiario: Michelle & Joshua');
                  }}
                >
                  Ver información
                </button>
              ) : (
                <a
                  href={registry.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gift-card-button"
                >
                  Visitar tienda
                </a>
              )}
            </motion.div>
          ))}
        </div>

        <motion.p
          className="gift-registry-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          ¡Gracias por ser parte de nuestro día especial!
        </motion.p>
      </motion.div>
    </section>
  );
};

export default GiftRegistry;
