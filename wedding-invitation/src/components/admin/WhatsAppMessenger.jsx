import { useEffect, useState } from 'react';
import useSeatingStore from '../../store/seatingStore';
import '../../styles/admin/WhatsAppMessenger.css';

// Template del mensaje
const MESSAGE_TEMPLATE = `¡Hola [Nombre del Invitado]!

¡La cuenta regresiva ha comenzado y estamos a punto de celebrar el amor de Michelle y Joshua!

Para que tu experiencia sea perfecta desde el momento en que llegues, te compartimos el enlace a tu mesa asignada. Así podrás encontrar tu lugar sin contratiempos y unirte rápidamente a la fiesta.

[Aquí va el link a la notificación de mesa]

Un pequeño consejo de los novios: el clima es tan impredecible como el amor a primera vista, ¡así que te recomendamos traer un abrigo o algo para cubrirte por si refresca! Queremos que disfrutes al máximo sin preocuparte por el frío.

Prepárate para una noche llena de alegría, baile y momentos inolvidables. ¡Estamos ansiosos por verte y celebrar juntos!

Con cariño,
Michelle y Joshua`;

function WhatsAppMessenger() {
  const { guests, assignments, loadGuests, loadAssignments, isLoading } = useSeatingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sentMessages, setSentMessages] = useState(() => {
    // Cargar mensajes enviados desde localStorage
    const saved = localStorage.getItem('whatsapp-sent-messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    loadGuests();
    loadAssignments();
  }, [loadGuests, loadAssignments]);

  // Guardar mensajes enviados en localStorage
  useEffect(() => {
    localStorage.setItem('whatsapp-sent-messages', JSON.stringify(sentMessages));
  }, [sentMessages]);

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const generateLink = (guestId) => {
    return `${getBaseUrl()}/seating?id=${guestId}`;
  };

  // Normalizar número de teléfono (quitar espacios, guiones, paréntesis)
  const normalizePhone = (phone) => {
    if (!phone) return '';
    // Convertir a string primero (por si viene como número desde Google Sheets)
    return String(phone).replace(/[\s\-\(\)]/g, '');
  };

  // Generar mensaje personalizado
  const generateMessage = (guest) => {
    const link = generateLink(guest.id);
    const nombre = guest.nombre.split(' ')[0]; // Usar solo el primer nombre

    return MESSAGE_TEMPLATE
      .replace('[Nombre del Invitado]', nombre)
      .replace('[Aquí va el link a la notificación de mesa]', link);
  };

  // Generar URL de WhatsApp Web
  const generateWhatsAppURL = (guest) => {
    const phone = normalizePhone(guest.telefono);
    const message = generateMessage(guest);
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phone}?text=${encodedMessage}`;
  };

  // Filtrar invitados elegibles
  const getEligibleGuests = () => {
    const assignedIds = new Set(assignments.map((a) => a.guestId));

    return guests.filter((guest) => {
      // Debe tener asistencia confirmada
      if (guest.asistencia !== 'Si' && guest.asistencia !== 'Sí') return false;

      // Debe tener mesa asignada
      if (!assignedIds.has(guest.id)) return false;

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

  const eligibleGuests = getEligibleGuests();
  const pendingCount = eligibleGuests.filter(g => !sentMessages.includes(g.id)).length;
  const sentCount = eligibleGuests.filter(g => sentMessages.includes(g.id)).length;

  if (isLoading) {
    return (
      <div className="whatsapp-messenger loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="whatsapp-messenger">
      <div className="messenger-header">
        <h2>Enviar Links por WhatsApp</h2>
        <div className="header-actions">
          <button className="reset-button" onClick={resetAll}>
            🔄 Resetear Estado
          </button>
          <button className="mark-all-button" onClick={markAllAsSent}>
            ✓ Marcar Todos Enviados
          </button>
        </div>
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
        <h3>📱 Instrucciones</h3>
        <ul>
          <li>Haz clic en "Abrir WhatsApp" para abrir una conversación con el mensaje pre-escrito</li>
          <li>El mensaje se abrirá en WhatsApp Web/Desktop, solo presiona "Enviar"</li>
          <li>Marca como enviado cuando termines para llevar control</li>
          <li>Solo se muestran invitados con: asistencia confirmada, mesa asignada y teléfono válido</li>
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
                : 'Asegúrate de que los invitados tengan: asistencia confirmada, mesa asignada y teléfono válido'}
            </p>
          </div>
        ) : (
          eligibleGuests.map((guest) => {
            const isSent = sentMessages.includes(guest.id);
            const assignment = assignments.find(a => a.guestId === guest.id);
            const tableLabel = assignment?.tableId || 'Sin mesa';

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
                    <span className="detail-item">🪑 {tableLabel}</span>
                    <span className="detail-item">
                      👥 {1 + parseInt(guest.acompanantes || 0)} persona{(1 + parseInt(guest.acompanantes || 0)) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="guest-actions">
                  <button
                    className="whatsapp-button"
                    onClick={() => handleOpenWhatsApp(guest)}
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

export default WhatsAppMessenger;
