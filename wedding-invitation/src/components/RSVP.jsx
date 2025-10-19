import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import '../styles/RSVP.css';

const RSVP = () => {
  // URL de Google Forms - el usuario agregará su propio enlace
  const googleFormUrl = "TU_ENLACE_DE_GOOGLE_FORM_AQUI";

  return (
    <section className="rsvp">
      <motion.div
        className="rsvp-content"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <FaHeart className="rsvp-icon" />
        <motion.h2
          className="rsvp-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Confirma tu Asistencia
        </motion.h2>
        <motion.p
          className="rsvp-description"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Tu presencia es muy importante para nosotros.
          Por favor confirma tu asistencia antes del 1 de Mayo.
        </motion.p>

        <motion.a
          href={googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rsvp-button"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Confirmar Asistencia
        </motion.a>

        <motion.p
          className="rsvp-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          Serás redirigido a un formulario para completar tus datos
        </motion.p>
      </motion.div>
    </section>
  );
};

export default RSVP;
