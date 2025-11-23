import { useEffect, useState } from 'react';
import useSeatingStore from '../../store/seatingStore';
import '../../styles/admin/LinkGenerator.css';

function LinkGenerator() {
  const { guests, assignments, loadGuests, loadAssignments, isLoading } = useSeatingStore();
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'unassigned'

  useEffect(() => {
    loadGuests();
    loadAssignments();
  }, [loadGuests, loadAssignments]);

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const generateLink = (guestId) => {
    return `${getBaseUrl()}/seating?id=${guestId}`;
  };

  const handleCopy = (guestId) => {
    const link = generateLink(guestId);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyAll = () => {
    const links = filteredGuests()
      .map((guest) => {
        const link = generateLink(guest.id);
        return `${guest.nombre}: ${link}`;
      })
      .join('\n');

    navigator.clipboard.writeText(links).then(() => {
      alert('Todos los links han sido copiados al portapapeles');
    });
  };

  const handleExportCSV = () => {
    const csv = [
      ['Nombre', 'Email', 'Teléfono', 'Acompañantes', 'Link'],
      ...filteredGuests().map((guest) => [
        guest.nombre,
        guest.email || '',
        guest.telefono || '',
        guest.acompanantes || 0,
        generateLink(guest.id),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitados-links-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const isAssigned = (guestId) => {
    return assignments.some((a) => a.guestId === guestId);
  };

  const filteredGuests = () => {
    const assignedIds = new Set(assignments.map((a) => a.guestId));

    switch (filter) {
      case 'assigned':
        return guests.filter((g) => assignedIds.has(g.id) && g.asistencia === 'Si');
      case 'unassigned':
        return guests.filter((g) => !assignedIds.has(g.id) && g.asistencia === 'Si');
      default:
        return guests.filter((g) => g.asistencia === 'Si');
    }
  };

  if (isLoading) {
    return (
      <div className="link-generator loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="link-generator">
      <div className="generator-header">
        <h2>Generar Links Personalizados</h2>
        <div className="header-actions">
          <button className="export-button" onClick={handleExportCSV}>
            📊 Exportar CSV
          </button>
          <button className="copy-all-button" onClick={handleCopyAll}>
            📋 Copiar Todos
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <label>Mostrar:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos los invitados</option>
          <option value="assigned">Solo asignados</option>
          <option value="unassigned">Solo sin asignar</option>
        </select>
        <span className="count">({filteredGuests().length} invitados)</span>
      </div>

      <div className="info-card">
        <h3>📌 Instrucciones</h3>
        <ul>
          <li>Cada invitado tiene un link único y personalizado</li>
          <li>Los links usan un ID anónimo, no el nombre del invitado</li>
          <li>Puedes copiar links individuales o exportar todos en CSV</li>
          <li>Envía estos links a tus invitados por WhatsApp, email, etc.</li>
          <li>Los invitados verán su mesa asignada al abrir el link</li>
        </ul>
      </div>

      <div className="links-list">
        {filteredGuests().length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay invitados en esta categoría</p>
            <p className="hint">
              {guests.length === 0
                ? 'Primero deben confirmar su asistencia desde el formulario RSVP'
                : 'Cambia el filtro para ver otros invitados'}
            </p>
          </div>
        ) : (
          filteredGuests().map((guest) => {
            const link = generateLink(guest.id);
            const assigned = isAssigned(guest.id);
            const totalGuests = 1 + parseInt(guest.acompanantes || 0);

            return (
              <div key={guest.id} className={`link-card ${assigned ? 'assigned' : 'unassigned'}`}>
                <div className="guest-details">
                  <div className="guest-name-section">
                    <h4>{guest.nombre}</h4>
                    <span className="guest-count">
                      👥 {totalGuests} persona{totalGuests > 1 ? 's' : ''}
                    </span>
                  </div>
                  {guest.email && <p className="contact-info">📧 {guest.email}</p>}
                  {guest.telefono && <p className="contact-info">📱 {guest.telefono}</p>}
                  {!assigned && <span className="warning-badge">⚠️ Sin mesa asignada</span>}
                </div>

                <div className="link-section">
                  <div className="link-display">
                    <input type="text" value={link} readOnly onClick={(e) => e.target.select()} />
                    <button
                      className={`copy-button ${copiedId === guest.id ? 'copied' : ''}`}
                      onClick={() => handleCopy(guest.id)}
                    >
                      {copiedId === guest.id ? '✓ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="preview-link">
                    🔗 Vista previa
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="summary-stats">
        <div className="stat-box">
          <span className="stat-number">{guests.filter((g) => g.asistencia === 'Si').length}</span>
          <span className="stat-label">Total confirmados</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">{assignments.length}</span>
          <span className="stat-label">Con mesa asignada</span>
        </div>
        <div className="stat-box">
          <span className="stat-number">
            {guests.filter((g) => g.asistencia === 'Si').length - assignments.length}
          </span>
          <span className="stat-label">Sin mesa asignada</span>
        </div>
      </div>
    </div>
  );
}

export default LinkGenerator;
