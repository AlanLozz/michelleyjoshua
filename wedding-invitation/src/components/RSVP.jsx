import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/RSVP.css';

const RSVP = () => {
  // URL del Google Apps Script - Se configurará después
  const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
  const SECRET_TOKEN = import.meta.env.VITE_FORM_SECRET_TOKEN || '';

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asistencia: '',
    acompanantes: '0',
    mensaje: '',
    honeypot: '' // Campo trampa para bots
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Validación: Honeypot (si está lleno, es un bot)
    if (formData.honeypot) {
      setIsSubmitting(false);
      // No mostramos mensaje de error para no revelar a los bots
      return;
    }

    // Rate limiting simple: no permitir envíos muy seguidos
    const now = Date.now();
    if (now - lastSubmitTime < 10000) { // 10 segundos
      setStatus({
        type: 'error',
        message: 'Por favor espera unos segundos antes de enviar nuevamente.'
      });
      setIsSubmitting(false);
      return;
    }

    // Validación básica de nombre
    if (formData.nombre.length < 3) {
      setStatus({
        type: 'error',
        message: 'Por favor ingresa tu nombre completo.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Preparar datos sin el honeypot
      const { honeypot, ...dataToSend } = formData;

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dataToSend,
          timestamp: new Date().toISOString(),
          token: SECRET_TOKEN // Token de seguridad
        })
      });

      // Con mode: 'no-cors' no podemos leer la respuesta, pero si llega aquí, se envió
      setStatus({
        type: 'success',
        message: '¡Gracias por confirmar! Hemos recibido tu respuesta.'
      });

      // Actualizar tiempo del último envío
      setLastSubmitTime(now);

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asistencia: '',
        acompanantes: '0',
        mensaje: '',
        honeypot: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Hubo un error al enviar. Por favor intenta nuevamente o contáctanos directamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rsvp" id="confirmar">
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
          Por favor confirma tu asistencia antes del 1 de Noviembre.
        </motion.p>

        <motion.form
          className="rsvp-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Campo honeypot - invisible para humanos, visible para bots */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex="-1"
            autoComplete="off"
          />

          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="asistencia">¿Confirmas tu asistencia? *</label>
            <select
              id="asistencia"
              name="asistencia"
              value={formData.asistencia}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="Si">Sí, asistiré con mucho gusto</option>
              <option value="No">No podré asistir</option>
            </select>
          </div>

          {formData.asistencia === 'Si' && (
            <motion.div
              className="form-group"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label htmlFor="acompanantes">Número de acompañantes</label>
              <input
                type="number"
                id="acompanantes"
                name="acompanantes"
                value={formData.acompanantes}
                onChange={handleChange}
                min="0"
                max="10"
              />
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="mensaje">Restricciones alimentarias o mensaje especial</label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows="4"
              placeholder="Alguna restricción alimentaria, mensaje especial o algo que quieras compartir con nosotros..."
            />
          </div>

          {status.message && (
            <motion.div
              className={`form-status ${status.type}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              <span>{status.message}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="rsvp-button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Confirmación'}
          </motion.button>
        </motion.form>
      </motion.div>
    </section>
  );
};

export default RSVP;
