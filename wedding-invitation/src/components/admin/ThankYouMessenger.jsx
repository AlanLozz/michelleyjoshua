import { useEffect, useState } from 'react';
import useSeatingStore from '../../store/seatingStore';
import '../../styles/admin/ThankYouMessenger.css';

// Template del mensaje de agradecimiento
const THANK_YOU_TEMPLATE = `¡Hola [Nombre del Invitado]!

Esperamos que hayas llegado bien a casa y que sigas con el corazón tan lleno de cariño como nosotros.

Queremos agradecerte de todo corazón por acompañarnos en el día más especial de nuestras vidas. Tu presencia hizo que nuestra boda fuera aún más memorable y significativa.

Cada sonrisa, cada abrazo y cada momento compartido contigo quedará por siempre en nuestros corazones. Gracias por ser parte de esta nueva etapa que comenzamos juntos.

📸 ¡Comparte tus fotos con nosotros!
Nos encantaría revivir la boda a través de tus ojos. Por favor, sube todas las fotos y videos que tomaste en este álbum de Google Fotos:

[Link de Google Fotos]

Mil gracias nuevamente por todo tu cariño y por hacer de nuestra boda un día inolvidable.

Con todo nuestro amor y gratitud,
Michelle y Joshua 🫶🏼`;

function ThankYouMessenger() {
  const { guests, loadGuests, isLoading } = useSeatingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [googlePhotosLink, setGooglePhotosLink] = useState(() => {
    // Cargar link de Google Fotos desde localStorage
    return localStorage.getItem('google-photos-link') || 'https://photos.app.goo.gl/gtRQUqVCRRSSKoWe9';
  });
  const [sentMessages, setSentMessages] = useState(() => {
    // Cargar mensajes enviados desde localStorage
    const saved = localStorage.getItem('thankyou-sent-messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [tempLink, setTempLink] = useState('');

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  // Guardar mensajes enviados en localStorage
  useEffect(() => {
    localStorage.setItem('thankyou-sent-messages', JSON.stringify(sentMessages));
  }, [sentMessages]);

  // Guardar link de Google Fotos en localStorage
  useEffect(() => {
    localStorage.setItem('google-photos-link', googlePhotosLink);
  }, [googlePhotosLink]);

  // Normalizar número de teléfono (quitar espacios, guiones, paréntesis)
  const normalizePhone = (phone) => {
    if (!phone) return '';
    // Convertir a string primero (por si viene como número desde Google Sheets)
    return String(phone).replace(/[\s\-()]/g, '');
  };

  // Generar mensaje personalizado
  const generateMessage = (guest) => {
    const nombre = guest.nombre.split(' ')[0]; // Usar solo el primer nombre
    const photosLink = googlePhotosLink || '[Pendiente: configura el link de Google Fotos]';

    return THANK_YOU_TEMPLATE
      .replace('[Nombre del Invitado]', nombre)
      .replace('[Link de Google Fotos]', photosLink);
  };

  // Generar URL de WhatsApp Web
  const generateWhatsAppURL = (guest) => {
    const phone = normalizePhone(guest.telefono);
    const message = generateMessage(guest);
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  // Filtrar invitados elegibles (que asistieron)
  const getEligibleGuests = () => {
    return guests.filter((guest) => {
      // Debe tener asistencia confirmada
      if (guest.asistencia !== 'Si' && guest.asistencia !== 'Sí') return false;

      // Debe tener teléfono válido
      const phone = normalizePhone(guest.telefono);
      if (!phone || phone.length < 10) return false;

      // Filtro de búsqueda
      if (searchTerm) {
        return guest.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return true;
    });
  };

  // Manejar apertura de WhatsApp
  const handleOpenWhatsApp = (guest) => {
    if (!googlePhotosLink) {
      alert('⚠️ Por favor configura el link de Google Fotos antes de enviar mensajes');
      return;
    }
    const url = generateWhatsAppURL(guest);
    window.open(url, '_blank');
  };

  // Marcar/desmarcar como enviado
  const toggleSent = (guestId) => {
    if (sentMessages.includes(guestId)) {
      setSentMessages(sentMessages.filter(id => id !== guestId));
    } else {
      setSentMessages([...sentMessages, guestId]);
    }
  };

  // Marcar todos como enviados
  const markAllAsSent = () => {
    const eligibleIds = getEligibleGuests().map(g => g.id);
    setSentMessages(eligibleIds);
  };

  // Resetear todos
  const resetAll = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el estado de todos los mensajes?')) {
      setSentMessages([]);
    }
  };

  // Abrir editor de link
  const startEditingLink = () => {
    setTempLink(googlePhotosLink);
    setIsEditingLink(true);
  };

  // Guardar link
  const saveLink = () => {
    setGooglePhotosLink(tempLink);
    setIsEditingLink(false);
  };

  // Cancelar edición
  const cancelEditingLink = () => {
    setIsEditingLink(false);
    setTempLink('');
  };

  const eligibleGuests = getEligibleGuests();
  const pendingCount = eligibleGuests.filter(g => !sentMessages.includes(g.id)).length;
  const sentCount = eligibleGuests.filter(g => sentMessages.includes(g.id)).length;

  if (isLoading) {
    return (
      <div className="thankyou-messenger loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="thankyou-messenger">
      <div className="messenger-header">
        <h2>💕 Mensajes de Agradecimiento</h2>
        <div className="header-actions">
          <button className="reset-button" onClick={resetAll}>
            🔄 Resetear Estado
          </button>
          <button className="mark-all-button" onClick={markAllAsSent}>
            ✓ Marcar Todos Enviados
          </button>
        </div>
      </div>

      {/* Configuración del link de Google Fotos */}
      <div className="google-photos-config">
        <div className="config-header">
          <h3>📸 Configuración del Álbum de Google Fotos</h3>
          {!isEditingLink && (
            <button className="edit-link-button" onClick={startEditingLink}>
              ✏️ {googlePhotosLink ? 'Editar Link' : 'Configurar Link'}
            </button>
          )}
        </div>

        {isEditingLink ? (
          <div className="link-editor">
            <input
              type="url"
              className="link-input"
              placeholder="https://photos.app.goo.gl/..."
              value={tempLink}
              onChange={(e) => setTempLink(e.target.value)}
            />
            <div className="editor-actions">
              <button className="save-button" onClick={saveLink}>
                💾 Guardar
              </button>
              <button className="cancel-button" onClick={cancelEditingLink}>
                ✖ Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="current-link">
            {googlePhotosLink ? (
              <>
                <span className="link-label">Link actual:</span>
                <a href={googlePhotosLink} target="_blank" rel="noopener noreferrer" className="link-display">
                  {googlePhotosLink}
                </a>
              </>
            ) : (
              <span className="no-link-warning">
                ⚠️ No hay link configurado. Por favor configura el álbum de Google Fotos antes de enviar mensajes.
              </span>
            )}
          </div>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="count">
          {eligibleGuests.length} invitados elegibles
        </span>
      </div>

      <div className="info-card">
        <h3>💌 Instrucciones</h3>
        <ul>
          <li><strong>Importante:</strong> Configura primero el link del álbum de Google Fotos</li>
          <li>Haz clic en "Abrir WhatsApp" para abrir una conversación con el mensaje de agradecimiento</li>
          <li>El mensaje se abrirá en WhatsApp Web/Desktop, solo presiona "Enviar"</li>
          <li>Marca como enviado cuando termines para llevar control</li>
          <li>Solo se muestran invitados con asistencia confirmada y teléfono válido</li>
          <li>El estado de envío se guarda automáticamente en tu navegador</li>
        </ul>
      </div>

      <div className="stats-bar">
        <div className="stat-item pending">
          <span className="stat-number">{pendingCount}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-item sent">
          <span className="stat-number">{sentCount}</span>
          <span className="stat-label">Enviados</span>
        </div>
        <div className="stat-item total">
          <span className="stat-number">{eligibleGuests.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="guests-list">
        {eligibleGuests.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay invitados elegibles</p>
            <p className="hint">
              {searchTerm
                ? 'No se encontraron invitados con ese nombre'
                : 'Asegúrate de que los invitados tengan asistencia confirmada y teléfono válido'}
            </p>
          </div>
        ) : (
          eligibleGuests.map((guest) => {
            const isSent = sentMessages.includes(guest.id);

            return (
              <div key={guest.id} className={`guest-card ${isSent ? 'sent' : 'pending'}`}>
                <div className="guest-info">
                  <div className="guest-header">
                    <h4>{guest.nombre}</h4>
                    <span className={`status-badge ${isSent ? 'sent' : 'pending'}`}>
                      {isSent ? '✓ Enviado' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <div className="guest-details-row">
                    <span className="detail-item">📱 {guest.telefono}</span>
                    <span className="detail-item">
                      👥 {1 + parseInt(guest.acompanantes || 0)} persona{(1 + parseInt(guest.acompanantes || 0)) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="guest-actions">
                  <button
                    className={`whatsapp-button ${!googlePhotosLink ? 'disabled' : ''}`}
                    onClick={() => handleOpenWhatsApp(guest)}
                    disabled={!googlePhotosLink}
                  >
                    💬 Abrir WhatsApp
                  </button>
                  <button
                    className="preview-button"
                    onClick={() => setSelectedGuest(selectedGuest?.id === guest.id ? null : guest)}
                  >
                    👁 {selectedGuest?.id === guest.id ? 'Ocultar' : 'Ver mensaje'}
                  </button>
                  <label className="sent-checkbox">
                    <input
                      type="checkbox"
                      checked={isSent}
                      onChange={() => toggleSent(guest.id)}
                    />
                    <span>Enviado</span>
                  </label>
                </div>

                {selectedGuest?.id === guest.id && (
                  <div className="message-preview">
                    <h5>Vista previa del mensaje:</h5>
                    <pre>{generateMessage(guest)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {eligibleGuests.length > 0 && (
        <div className="bottom-actions">
          <p className="progress-text">
            Progreso: {sentCount} de {eligibleGuests.length} mensajes enviados ({Math.round((sentCount / eligibleGuests.length) * 100)}%)
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(sentCount / eligibleGuests.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ThankYouMessenger;
