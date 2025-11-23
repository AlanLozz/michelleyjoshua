import { useEffect, useState } from 'react';
import useSeatingStore from '../../store/seatingStore';
import '../../styles/admin/GuestAssigner.css';

function GuestAssigner() {
  const {
    guests,
    layout,
    assignments,
    loadGuests,
    loadLayout,
    loadAssignments,
    assignGuestToTable,
    removeAssignment,
    saveAssignments,
    getTableById,
    getTableAvailableCapacity,
    getGuestsByTable,
    getUnassignedGuests,
    isLoading,
  } = useSeatingStore();

  const [selectedTable, setSelectedTable] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'unassigned'

  useEffect(() => {
    loadGuests();
    loadLayout();
    loadAssignments();
  }, [loadGuests, loadLayout, loadAssignments]);

  const handleAssign = (guestId, tableId) => {
    const table = getTableById(tableId);
    const guest = guests.find((g) => g.id === guestId);

    if (!table || !guest) return;

    const totalGuests = 1 + parseInt(guest.acompanantes || 0);
    const available = getTableAvailableCapacity(tableId);

    if (totalGuests > available) {
      alert(`No hay espacio suficiente en esta mesa. Disponible: ${available}, Necesario: ${totalGuests}`);
      return;
    }

    assignGuestToTable(guestId, tableId);
  };

  const handleUnassign = (guestId) => {
    if (confirm('¿Estás seguro de querer desasignar a este invitado?')) {
      removeAssignment(guestId);
    }
  };

  const handleSave = async () => {
    const result = await saveAssignments();
    if (result.success) {
      alert('Asignaciones guardadas exitosamente');
    } else {
      alert('Error al guardar las asignaciones: ' + result.error);
    }
  };

  const filteredGuests = () => {
    const unassigned = getUnassignedGuests();
    const assignedIds = new Set(assignments.map((a) => a.guestId));

    switch (filter) {
      case 'unassigned':
        return unassigned;
      case 'assigned':
        return guests.filter((g) => assignedIds.has(g.id) && g.asistencia === 'Si');
      default:
        return guests.filter((g) => g.asistencia === 'Si');
    }
  };

  const getGuestAssignment = (guestId) => {
    const assignment = assignments.find((a) => a.guestId === guestId);
    if (!assignment) return null;
    const table = getTableById(assignment.tableId);
    return table;
  };

  if (isLoading) {
    return (
      <div className="guest-assigner loading">
        <div className="spinner"></div>
        <p>Cargando invitados...</p>
      </div>
    );
  }

  return (
    <div className="guest-assigner">
      <div className="assigner-header">
        <h2>Asignar Invitados a Mesas</h2>
        <button className="save-button" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Guardando...' : '💾 Guardar Asignaciones'}
        </button>
      </div>

      <div className="assigner-content">
        <div className="guests-panel">
          <div className="panel-header">
            <h3>Invitados ({filteredGuests().length})</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="unassigned">Sin asignar</option>
              <option value="assigned">Asignados</option>
            </select>
          </div>

          <div className="guests-list">
            {filteredGuests().length === 0 ? (
              <p className="empty-message">No hay invitados en esta categoría</p>
            ) : (
              filteredGuests().map((guest) => {
                const assignment = getGuestAssignment(guest.id);
                const totalGuests = 1 + parseInt(guest.acompanantes || 0);

                return (
                  <div key={guest.id} className={`guest-card ${assignment ? 'assigned' : ''}`}>
                    <div className="guest-info">
                      <p className="guest-name">{guest.nombre}</p>
                      <p className="guest-details">
                        👥 {totalGuests} persona{totalGuests > 1 ? 's' : ''}
                      </p>
                    </div>

                    {assignment ? (
                      <div className="assignment-info">
                        <span className="table-badge">{assignment.label}</span>
                        <button className="unassign-button" onClick={() => handleUnassign(guest.id)}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        className="table-select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssign(guest.id, e.target.value);
                          }
                        }}
                      >
                        <option value="">Asignar a...</option>
                        {layout.tables.map((table) => {
                          const available = getTableAvailableCapacity(table.id);
                          const canFit = totalGuests <= available;
                          return (
                            <option key={table.id} value={table.id} disabled={!canFit}>
                              {table.label} ({available} disponible{available !== 1 ? 's' : ''})
                              {!canFit && ' - No cabe'}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="tables-panel">
          <div className="panel-header">
            <h3>Mesas ({layout.tables.length})</h3>
          </div>

          <div className="tables-list">
            {layout.tables.length === 0 ? (
              <p className="empty-message">No hay mesas creadas. Ve al tab "Editor de Layout".</p>
            ) : (
              layout.tables.map((table) => {
                const assignedGuests = getGuestsByTable(table.id);
                const totalAssigned = assignedGuests.reduce((sum, a) => sum + 1 + a.companions, 0);
                const available = getTableAvailableCapacity(table.id);

                return (
                  <div
                    key={table.id}
                    className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="table-header-info">
                      <h4>{table.label}</h4>
                      <span className="table-type">{table.type === 'round' ? '⭕' : '▭'}</span>
                    </div>
                    <div className="table-capacity">
                      <div className="capacity-bar">
                        <div
                          className="capacity-fill"
                          style={{
                            width: `${(totalAssigned / table.capacity) * 100}%`,
                            backgroundColor:
                              totalAssigned === table.capacity
                                ? '#C1502E'
                                : totalAssigned > table.capacity
                                ? '#dc3545'
                                : '#8B4789',
                          }}
                        ></div>
                      </div>
                      <p className="capacity-text">
                        {totalAssigned} / {table.capacity} personas
                        {available > 0 && ` (${available} disponible${available !== 1 ? 's' : ''})`}
                      </p>
                    </div>

                    {assignedGuests.length > 0 && (
                      <div className="assigned-guests">
                        {assignedGuests.map((assignment) => (
                          <span key={assignment.guestId} className="guest-chip">
                            {assignment.guestName}
                            {assignment.companions > 0 && ` +${assignment.companions}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat">
          <span className="stat-label">Total invitados confirmados:</span>
          <span className="stat-value">{guests.filter((g) => g.asistencia === 'Si').length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Asignados:</span>
          <span className="stat-value">{assignments.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Sin asignar:</span>
          <span className="stat-value">{getUnassignedGuests().length}</span>
        </div>
      </div>
    </div>
  );
}

export default GuestAssigner;
