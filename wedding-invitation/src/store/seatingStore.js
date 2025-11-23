import { create } from 'zustand';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const SECRET_TOKEN = import.meta.env.VITE_FORM_SECRET_TOKEN;

const useSeatingStore = create((set, get) => ({
  // Layout del salón
  layout: {
    tables: [
      // Ejemplo de estructura:
      // {
      //   id: 'table-1',
      //   type: 'round', // 'round' | 'rectangular'
      //   label: 'Mesa 1',
      //   position: { x: 100, y: 100 },
      //   capacity: 8,
      //   rotation: 0
      // }
    ],
    elements: [
      // Ejemplo de estructura:
      // {
      //   id: 'element-1',
      //   type: 'bar', // 'bar' | 'bathroom' | 'garden' | 'games' | 'entrance'
      //   label: 'Barra de bebidas',
      //   position: { x: 500, y: 100 },
      //   width: 200,
      //   height: 100,
      //   rotation: 0
      // }
    ],
  },

  // Asignaciones de invitados a mesas
  assignments: [
    // Ejemplo de estructura:
    // {
    //   guestId: 'guest-123',
    //   tableId: 'table-1',
    //   guestName: 'Juan Pérez',
    //   companions: 2
    // }
  ],

  // Invitados confirmados (desde Google Sheets)
  guests: [
    // Ejemplo de estructura:
    // {
    //   id: 'generated-id',
    //   nombre: 'Juan Pérez',
    //   asistencia: 'Si',
    //   acompanantes: 2,
    //   email: 'juan@example.com',
    //   telefono: '+521234567890'
    // }
  ],

  // Estado de carga
  isLoading: false,
  error: null,

  // ===== ACCIONES PARA LAYOUT =====

  // Agregar mesa
  addTable: (table) => set((state) => ({
    layout: {
      ...state.layout,
      tables: [
        ...state.layout.tables,
        {
          ...table,
          id: table.id || `table-${Date.now()}`,
        },
      ],
    },
  })),

  // Actualizar posición/propiedades de mesa
  updateTable: (tableId, updates) => set((state) => ({
    layout: {
      ...state.layout,
      tables: state.layout.tables.map((table) =>
        table.id === tableId ? { ...table, ...updates } : table
      ),
    },
  })),

  // Eliminar mesa
  removeTable: (tableId) => set((state) => ({
    layout: {
      ...state.layout,
      tables: state.layout.tables.filter((table) => table.id !== tableId),
    },
    // También eliminar asignaciones de esta mesa
    assignments: state.assignments.filter((assignment) => assignment.tableId !== tableId),
  })),

  // Agregar elemento decorativo
  addElement: (element) => set((state) => ({
    layout: {
      ...state.layout,
      elements: [
        ...state.layout.elements,
        {
          ...element,
          id: element.id || `element-${Date.now()}`,
        },
      ],
    },
  })),

  // Actualizar elemento
  updateElement: (elementId, updates) => set((state) => ({
    layout: {
      ...state.layout,
      elements: state.layout.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      ),
    },
  })),

  // Eliminar elemento
  removeElement: (elementId) => set((state) => ({
    layout: {
      ...state.layout,
      elements: state.layout.elements.filter((element) => element.id !== elementId),
    },
  })),

  // Guardar layout completo
  saveLayout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { layout } = get();
      // Guardar en Google Sheets o backend
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necesario para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: SECRET_TOKEN,
          action: 'saveLayout',
          layout
        }),
      });

      // Con no-cors no podemos leer la respuesta, asumimos éxito si no hay error
      set({ isLoading: false });
      console.log('Layout enviado a Google Sheets');
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      console.error('Error guardando layout:', error);
      return { success: false, error: error.message };
    }
  },

  // Cargar layout
  loadLayout: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching layout from:', `${SCRIPT_URL}?action=getLayout`);
      const response = await fetch(`${SCRIPT_URL}?action=getLayout`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Primero obtener el texto raw para debugging
      const rawText = await response.text();
      console.log('Respuesta RAW del servidor:', rawText);
      console.log('Primeros 100 caracteres:', rawText.substring(0, 100));

      // Intentar parsear el JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError);
        console.error('Texto que falló:', rawText);
        throw new Error(`Error parseando respuesta: ${parseError.message}`);
      }

      console.log('Layout data recibida:', data);

      if (data.warning) {
        console.warn('⚠️ Warning del servidor:', data.warning);
      }

      if (data.layout) {
        console.log('Actualizando layout en el store con:', data.layout);
        set({ layout: data.layout, isLoading: false });
        return {
          success: true,
          layout: data.layout,
          warning: data.warning
        };
      } else {
        console.warn('No se encontró layout en la respuesta');
        set({ isLoading: false });
        return { success: false, error: 'No se encontró layout' };
      }
    } catch (error) {
      console.error('Error cargando layout:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // ===== ACCIONES PARA ASIGNACIONES =====

  // Asignar invitado a mesa
  assignGuestToTable: (guestId, tableId) => set((state) => {
    const guest = state.guests.find((g) => g.id === guestId);
    const existingAssignment = state.assignments.find((a) => a.guestId === guestId);

    if (existingAssignment) {
      // Actualizar asignación existente
      return {
        assignments: state.assignments.map((a) =>
          a.guestId === guestId ? { ...a, tableId } : a
        ),
      };
    } else {
      // Crear nueva asignación
      return {
        assignments: [
          ...state.assignments,
          {
            guestId,
            tableId,
            guestName: guest?.nombre || 'Desconocido',
            companions: parseInt(guest?.acompanantes || 0),
          },
        ],
      };
    }
  }),

  // Remover asignación
  removeAssignment: (guestId) => set((state) => ({
    assignments: state.assignments.filter((a) => a.guestId !== guestId),
  })),

  // Guardar asignaciones
  saveAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { assignments } = get();
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necesario para Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: SECRET_TOKEN,
          action: 'saveAssignments',
          assignments
        }),
      });

      // Con no-cors no podemos leer la respuesta, asumimos éxito si no hay error
      set({ isLoading: false });
      console.log('Asignaciones enviadas a Google Sheets');
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      console.error('Error guardando asignaciones:', error);
      return { success: false, error: error.message };
    }
  },

  // Cargar asignaciones
  loadAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getAssignments`);
      const data = await response.json();
      if (data.assignments) {
        set({ assignments: data.assignments, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // ===== ACCIONES PARA INVITADOS =====

  // Cargar invitados confirmados
  loadGuests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getGuests`);
      const data = await response.json();
      if (data.guests) {
        // Confiar en los IDs que vienen del backend
        // El backend es responsable de generar y persistir IDs únicos y estables
        set({ guests: data.guests, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // ===== HELPERS =====

  // Obtener mesa por ID
  getTableById: (tableId) => {
    const { layout } = get();
    return layout.tables.find((table) => table.id === tableId);
  },

  // Obtener capacidad disponible de una mesa
  getTableAvailableCapacity: (tableId) => {
    const { layout, assignments } = get();
    const table = layout.tables.find((t) => t.id === tableId);
    if (!table) return 0;

    const assignedToTable = assignments.filter((a) => a.tableId === tableId);
    const totalAssigned = assignedToTable.reduce(
      (sum, a) => sum + 1 + a.companions,
      0
    );

    return table.capacity - totalAssigned;
  },

  // Obtener invitados asignados a una mesa
  getGuestsByTable: (tableId) => {
    const { assignments } = get();
    return assignments.filter((a) => a.tableId === tableId);
  },

  // Obtener invitados no asignados
  getUnassignedGuests: () => {
    const { guests, assignments } = get();
    const assignedIds = new Set(assignments.map((a) => a.guestId));
    return guests.filter((g) => !assignedIds.has(g.id) && g.asistencia === 'Si');
  },
}));

export default useSeatingStore;
