import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Circle, Rect, Text, Group, Arc } from 'react-konva';
import useSeatingStore from '../../store/seatingStore';
import '../../styles/admin/LayoutEditor.css';

function LayoutEditor() {
  const { layout, addTable, updateTable, removeTable, addElement, updateElement, removeElement, saveLayout, loadLayout, isLoading, error } = useSeatingStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [stageSize] = useState({ width: 1200, height: 700 });
  const stageRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Cargar layout guardado al montar el componente
  useEffect(() => {
    const loadData = async () => {
      console.log('Cargando layout desde Google Sheets...');
      setLoadingLayout(true);
      const result = await loadLayout();
      setLoadingLayout(false);

      if (result?.success) {
        console.log('Layout cargado exitosamente:', result.layout);
        if (result.warning) {
          alert('⚠️ ' + result.warning + '\n\nPuedes crear un nuevo layout o importar uno desde un archivo.');
        }
      } else {
        console.error('Error al cargar layout:', result?.error);
      }
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar selectedItem cuando cambie el layout (para reflejar cambios en tiempo real)
  useEffect(() => {
    if (selectedItemRef.current) {
      const updated = selectedItemRef.current.type === 'table'
        ? layout.tables.find(t => t.id === selectedItemRef.current.id)
        : layout.elements.find(e => e.id === selectedItemRef.current.id);

      if (updated) {
        // Solo actualizar data, mantener id y type
        setSelectedItem(prev => prev ? { ...prev, data: updated } : null);
      } else {
        // Si el elemento fue eliminado, deseleccionar
        setSelectedItem(null);
        selectedItemRef.current = null;
      }
    }
  }, [layout]);

  // Mantener ref sincronizada con selectedItem
  useEffect(() => {
    selectedItemRef.current = selectedItem;
  }, [selectedItem]);

  const handleAddTable = (type) => {
    const newTable = {
      id: `table-${Date.now()}`,
      type,
      label: `Mesa ${layout.tables.length + 1}`,
      position: { x: 100, y: 100 },
      capacity: type === 'round' ? 8 : 12,
      rotation: 0,
    };
    addTable(newTable);
  };

  const getDefaultElementConfig = (type) => {
    const configs = {
      bar: { label: 'Barra de bebidas', width: 200, height: 100, color: '#F08080' },
      bathroom: { label: 'Baños', width: 100, height: 80, color: '#E8B4B8' },
      garden: { label: 'Jardín', width: 400, height: 300, color: '#8A9B68' },
      games: { label: 'Juegos', width: 200, height: 200, color: '#D4AF37' },
      entrance: { label: 'Entrada', width: 120, height: 80, color: '#8B4789' },
      wall: { label: 'Pared', width: 300, height: 20, color: '#4A3C2F' },
      arch: { label: 'Arco', width: 100, height: 200, color: '#D4AF37' },
      tree: { label: 'Árbol', width: 80, height: 80, color: '#2F5233' },
      stage: { label: 'Tarima', width: 300, height: 150, color: '#4A3C2F' },
      dancefloor: { label: 'Pista de baile', width: 400, height: 400, color: '#F5F1E8' },
      fountain: { label: 'Fuente', width: 120, height: 120, color: '#87CEEB' },
      altar: { label: 'Altar', width: 200, height: 150, color: '#F5DEB3' },
    };
    return configs[type] || { label: 'Elemento', width: 150, height: 80, color: '#8A9B68' };
  };

  const handleAddElement = (type) => {
    const config = getDefaultElementConfig(type);
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      label: config.label,
      position: { x: 500, y: 100 },
      width: config.width,
      height: config.height,
      color: config.color,
      rotation: 0,
    };
    addElement(newElement);
  };

  const handleDragEnd = (e, itemId, itemType) => {
    const newPos = {
      x: e.target.x(),
      y: e.target.y(),
    };

    if (itemType === 'table') {
      updateTable(itemId, { position: newPos });
    } else {
      updateElement(itemId, { position: newPos });
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    if (selectedItem.type === 'table') {
      removeTable(selectedItem.id);
    } else {
      removeElement(selectedItem.id);
    }
    setSelectedItem(null);
  };

  const handleSave = async () => {
    const result = await saveLayout();
    if (result.success) {
      alert('Layout guardado exitosamente');
    } else {
      alert('Error al guardar el layout: ' + result.error);
    }
  };

  const handleExportLayout = () => {
    // Crear un archivo JSON con el layout actual
    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    // Crear un enlace temporal y hacer clic automáticamente para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Layout exportado exitosamente');
  };

  const handleCopyLayout = async () => {
    try {
      const dataStr = JSON.stringify(layout, null, 2);
      await navigator.clipboard.writeText(dataStr);
      alert('Layout copiado al portapapeles. Puedes pegarlo en un archivo de texto para guardarlo.');
    } catch (error) {
      alert('Error al copiar al portapapeles: ' + error.message);
    }
  };

  const handleImportFromFile = () => {
    // Crear un input file temporal
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedLayout = JSON.parse(event.target.result);

          // Validar que tenga la estructura correcta
          if (!importedLayout.tables || !importedLayout.elements) {
            throw new Error('El archivo no tiene el formato correcto de layout');
          }

          // Confirmar antes de reemplazar
          if (confirm('¿Estás seguro de que quieres reemplazar el layout actual? Esta acción no se puede deshacer.')) {
            // Actualizar el layout en el store
            useSeatingStore.setState({ layout: importedLayout });
            alert('Layout importado exitosamente. No olvides guardarlo.');
          }
        } catch (error) {
          alert('Error al importar el archivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleImportFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const importedLayout = JSON.parse(clipboardText);

      // Validar que tenga la estructura correcta
      if (!importedLayout.tables || !importedLayout.elements) {
        throw new Error('El texto del portapapeles no tiene el formato correcto de layout');
      }

      // Confirmar antes de reemplazar
      if (confirm('¿Estás seguro de que quieres reemplazar el layout actual? Esta acción no se puede deshacer.')) {
        // Actualizar el layout en el store
        useSeatingStore.setState({ layout: importedLayout });
        alert('Layout importado exitosamente desde el portapapeles. No olvides guardarlo.');
      }
    } catch (error) {
      alert('Error al importar desde el portapapeles: ' + error.message + '\n\nAsegúrate de haber copiado un JSON válido.');
    }
  };

  const renderTable = (table) => {
    const isSelected = selectedItem?.id === table.id;
    const x = table.position.x;
    const y = table.position.y;
    const rotation = table.rotation || 0;

    if (table.type === 'round') {
      const radius = table.radius || 40;
      return (
        <Group
          key={table.id}
          x={x}
          y={y}
          rotation={rotation}
          draggable
          onDragEnd={(e) => handleDragEnd(e, table.id, 'table')}
          onClick={() => setSelectedItem({ id: table.id, type: 'table', data: table })}
        >
          <Circle
            radius={radius}
            fill={isSelected ? '#8B4789' : '#F5F1E8'}
            stroke={isSelected ? '#C1502E' : '#D4AF37'}
            strokeWidth={isSelected ? 4 : 2}
            shadowBlur={10}
            shadowColor="#000"
            shadowOpacity={0.2}
          />
          <Text
            text={table.label}
            fontSize={14}
            fontFamily="Playfair Display"
            fill={isSelected ? 'white' : '#4A3C2F'}
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={radius * 0.75}
            offsetY={7}
            width={radius * 1.5}
          />
        </Group>
      );
    } else {
      const width = table.width || 120;
      const height = table.height || 40;
      return (
        <Group
          key={table.id}
          x={x}
          y={y}
          rotation={rotation}
          draggable
          onDragEnd={(e) => handleDragEnd(e, table.id, 'table')}
          onClick={() => setSelectedItem({ id: table.id, type: 'table', data: table })}
        >
          <Rect
            width={width}
            height={height}
            fill={isSelected ? '#8B4789' : '#F5F1E8'}
            stroke={isSelected ? '#C1502E' : '#D4AF37'}
            strokeWidth={isSelected ? 4 : 2}
            cornerRadius={10}
            shadowBlur={10}
            shadowColor="#000"
            shadowOpacity={0.2}
          />
          <Text
            text={table.label}
            fontSize={14}
            fontFamily="Playfair Display"
            fill={isSelected ? 'white' : '#4A3C2F'}
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            x={0}
            y={height / 2 - 7}
            width={width}
          />
        </Group>
      );
    }
  };

  const renderElement = (element) => {
    const isSelected = selectedItem?.id === element.id;
    const x = element.position.x;
    const y = element.position.y;
    const width = element.width || 100;
    const height = element.height || 100;
    const rotation = element.rotation || 0;
    const fill = element.color || '#8A9B68';

    // Renderizado especial para árboles
    if (element.type === 'tree') {
      const radius = Math.min(width, height) / 2;
      const trunkWidth = radius / 3;
      const trunkHeight = radius / 2;

      return (
        <Group
          key={element.id}
          x={x}
          y={y}
          rotation={rotation}
          draggable
          onDragEnd={(e) => handleDragEnd(e, element.id, 'element')}
          onClick={() => setSelectedItem({ id: element.id, type: 'element', data: element })}
        >
          {/* Copa del árbol */}
          <Circle
            x={radius}
            y={radius}
            radius={radius}
            fill={fill}
            opacity={isSelected ? 0.9 : 0.7}
            stroke={isSelected ? '#C1502E' : '#2F5233'}
            strokeWidth={isSelected ? 3 : 2}
          />
          {/* Tronco */}
          <Rect
            x={radius - trunkWidth / 2}
            y={radius + radius - 5}
            width={trunkWidth}
            height={trunkHeight}
            fill="#4A3C2F"
            opacity={0.8}
          />
          <Text
            text={element.label}
            fontSize={10}
            fontFamily="Montserrat"
            fill="#FFF"
            fontStyle="bold"
            align="center"
            x={0}
            y={radius - 5}
            width={radius * 2}
          />
        </Group>
      );
    }

    // Renderizado especial para arcos con curvas reales
    if (element.type === 'arch') {
      const pillarWidth = Math.max(width * 0.15, 10); // 15% del ancho, mínimo 10px
      const pillarHeight = height * 0.8; // 80% de la altura total
      const archRadius = width / 2; // Radio del arco = mitad del ancho
      const archThickness = Math.max(width * 0.1, 8); // Grosor del arco

      return (
        <Group
          key={element.id}
          x={x}
          y={y}
          rotation={rotation}
          draggable
          onDragEnd={(e) => handleDragEnd(e, element.id, 'element')}
          onClick={() => setSelectedItem({ id: element.id, type: 'element', data: element })}
        >
          {/* Pilar izquierdo */}
          <Rect
            x={0}
            y={height - pillarHeight}
            width={pillarWidth}
            height={pillarHeight}
            fill={fill}
            opacity={isSelected ? 0.9 : 0.7}
            cornerRadius={3}
            stroke={isSelected ? '#C1502E' : '#4A3C2F'}
            strokeWidth={isSelected ? 3 : 2}
          />

          {/* Pilar derecho */}
          <Rect
            x={width - pillarWidth}
            y={height - pillarHeight}
            width={pillarWidth}
            height={pillarHeight}
            fill={fill}
            opacity={isSelected ? 0.9 : 0.7}
            cornerRadius={3}
            stroke={isSelected ? '#C1502E' : '#4A3C2F'}
            strokeWidth={isSelected ? 3 : 2}
          />

          {/* Arco semicircular superior */}
          <Arc
            x={width / 2}
            y={height - pillarHeight}
            innerRadius={archRadius - archThickness}
            outerRadius={archRadius}
            angle={180}
            rotation={180}
            fill={fill}
            opacity={isSelected ? 0.9 : 0.7}
            stroke={isSelected ? '#C1502E' : '#4A3C2F'}
            strokeWidth={isSelected ? 3 : 2}
          />

          <Text
            text={element.label}
            fontSize={12}
            fontFamily="Montserrat"
            fill="#4A3C2F"
            fontStyle="bold"
            align="center"
            x={0}
            y={height - pillarHeight / 2}
            width={width}
          />
        </Group>
      );
    }

    // Renderizado especial para paredes (líneas gruesas)
    if (element.type === 'wall') {
      return (
        <Group
          key={element.id}
          x={x}
          y={y}
          rotation={rotation}
          draggable
          onDragEnd={(e) => handleDragEnd(e, element.id, 'element')}
          onClick={() => setSelectedItem({ id: element.id, type: 'element', data: element })}
        >
          <Rect
            width={width}
            height={height}
            fill={fill}
            opacity={isSelected ? 0.9 : 0.8}
            cornerRadius={2}
            stroke={isSelected ? '#C1502E' : '#2F2F2F'}
            strokeWidth={isSelected ? 3 : 1}
          />
          <Text
            text={element.label}
            fontSize={10}
            fontFamily="Montserrat"
            fill="#FFF"
            fontStyle="bold"
            align="center"
            x={0}
            y={height / 2 - 5}
            width={width}
          />
        </Group>
      );
    }

    // Renderizado estándar para otros elementos
    return (
      <Group
        key={element.id}
        x={x}
        y={y}
        rotation={rotation}
        draggable
        onDragEnd={(e) => handleDragEnd(e, element.id, 'element')}
        onClick={() => setSelectedItem({ id: element.id, type: 'element', data: element })}
      >
        <Rect
          width={width}
          height={height}
          fill={fill}
          opacity={isSelected ? 0.9 : 0.6}
          cornerRadius={5}
          stroke={isSelected ? '#C1502E' : '#4A3C2F'}
          strokeWidth={isSelected ? 3 : 1}
        />
        <Text
          text={element.label}
          fontSize={12}
          fontFamily="Montserrat"
          fill="#4A3C2F"
          fontStyle="bold"
          align="center"
          verticalAlign="middle"
          width={width}
          y={height / 2 - 8}
        />
      </Group>
    );
  };

  const handleUpdateName = (newLabel) => {
    if (!selectedItem || !newLabel.trim()) return;

    if (selectedItem.type === 'table') {
      updateTable(selectedItem.id, { label: newLabel });
    } else {
      updateElement(selectedItem.id, { label: newLabel });
    }
  };

  const handleUpdateSize = (property, value) => {
    if (!selectedItem) return;

    const numValue = parseInt(value) || 0;
    if (selectedItem.type === 'table') {
      updateTable(selectedItem.id, { [property]: numValue });
    } else {
      updateElement(selectedItem.id, { [property]: numValue });
    }
  };

  const getElementIcon = (type) => {
    const icons = {
      bar: '🍹',
      bathroom: '🚻',
      garden: '🌳',
      games: '🎮',
      entrance: '🚪',
      wall: '🧱',
      arch: '🏛️',
      tree: '🌴',
      stage: '🎭',
      dancefloor: '💃',
      fountain: '⛲',
      altar: '✝️',
    };
    return icons[type] || '📦';
  };

  const getSizeRanges = (type, elementType) => {
    if (elementType === 'table') {
      if (type === 'round') {
        return { radius: { min: 20, max: 80 } };
      } else {
        return {
          width: { min: 60, max: 200 },
          height: { min: 30, max: 100 },
        };
      }
    }

    // Rangos para elementos
    const ranges = {
      bathroom: { width: { min: 50, max: 200 }, height: { min: 50, max: 150 } },
      entrance: { width: { min: 50, max: 150 }, height: { min: 50, max: 100 } },
      bar: { width: { min: 100, max: 400 }, height: { min: 80, max: 200 } },
      games: { width: { min: 100, max: 300 }, height: { min: 100, max: 250 } },
      garden: { width: { min: 200, max: 1500 }, height: { min: 200, max: 800 } },
      dancefloor: { width: { min: 150, max: 600 }, height: { min: 150, max: 600 } },
      stage: { width: { min: 150, max: 500 }, height: { min: 100, max: 300 } },
      tree: { width: { min: 50, max: 150 }, height: { min: 50, max: 150 } },
      wall: { width: { min: 10, max: 1500 }, height: { min: 10, max: 1000 } },
      arch: { width: { min: 50, max: 200 }, height: { min: 100, max: 300 } },
      fountain: { width: { min: 60, max: 200 }, height: { min: 60, max: 200 } },
      altar: { width: { min: 100, max: 400 }, height: { min: 80, max: 300 } },
    };

    return ranges[type] || { width: { min: 50, max: 400 }, height: { min: 50, max: 300 } };
  };

  const handleSelectFromList = (id, type) => {
    const data = type === 'table'
      ? layout.tables.find(t => t.id === id)
      : layout.elements.find(e => e.id === id);

    if (data) {
      setSelectedItem({ id, type, data });
    }
  };

  return (
    <div className="layout-editor">
      <div className="editor-header">
        <h2>Editor de Layout del Salón</h2>
        <div className="header-actions">
          <button className="import-button" onClick={handleImportFromClipboard} title="Pegar JSON desde portapapeles">
            📌 Pegar
          </button>
          <button className="import-button" onClick={handleImportFromFile} title="Cargar archivo JSON">
            📤 Importar
          </button>
          <div className="actions-separator"></div>
          <button className="export-button" onClick={handleCopyLayout} title="Copiar al portapapeles">
            📋 Copiar
          </button>
          <button className="export-button" onClick={handleExportLayout} title="Descargar archivo JSON">
            📥 Exportar
          </button>
          <button className="save-button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : '💾 Guardar Layout'}
          </button>
        </div>
      </div>

      {/* Indicador de carga inicial */}
      {loadingLayout && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#f0f0f0',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <p>⏳ Cargando layout desde Google Sheets...</p>
        </div>
      )}

      {/* Indicador de error */}
      {error && !loadingLayout && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <p>❌ Error al cargar layout: {error}</p>
          <button
            onClick={() => { setLoadingLayout(true); loadLayout().finally(() => setLoadingLayout(false)); }}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            🔄 Reintentar
          </button>
        </div>
      )}

      {/* Toolbar Superior */}
      <div className="toolbar-top">
        <div className="toolbar-group">
          <label className="toolbar-label">Mesas:</label>
          <button className="toolbar-btn" onClick={() => handleAddTable('round')}>
            ⭕ Mesa Redonda
          </button>
          <button className="toolbar-btn" onClick={() => handleAddTable('rectangular')}>
            ▭ Mesa Rectangular
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <label className="toolbar-label">Áreas:</label>
          <button className="toolbar-btn" onClick={() => handleAddElement('bar')}>
            🍹 Barra
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('bathroom')}>
            🚻 Baños
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('garden')}>
            🌳 Jardín
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('games')}>
            🎮 Juegos
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('dancefloor')}>
            💃 Pista de baile
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('stage')}>
            🎭 Tarima
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <label className="toolbar-label">Decoración:</label>
          <button className="toolbar-btn" onClick={() => handleAddElement('entrance')}>
            🚪 Entrada
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('wall')}>
            🧱 Pared
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('arch')}>
            🏛️ Arco
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('tree')}>
            🌴 Árbol
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('fountain')}>
            ⛲ Fuente
          </button>
          <button className="toolbar-btn" onClick={() => handleAddElement('altar')}>
            ✝️ Altar
          </button>
        </div>
      </div>

      {/* Selector de Elementos */}
      <div className="element-selector">
        <div className="selector-header">
          <span className="selector-title">📋 Elementos en el Canvas</span>
          <span className="selector-count">
            {layout.tables.length} mesa{layout.tables.length !== 1 ? 's' : ''}, {layout.elements.length} elemento{layout.elements.length !== 1 ? 's' : ''}
          </span>
          {selectedItem && (
            <button className="deselect-button" onClick={() => setSelectedItem(null)}>
              ✕ Deseleccionar
            </button>
          )}
        </div>

        <div className="selector-list">
          {/* Mesas */}
          {layout.tables.length > 0 && (
            <div className="selector-group">
              <label className="group-label">Mesas:</label>
              <div className="chips-container">
                {layout.tables.map((table) => (
                  <button
                    key={table.id}
                    className={`element-chip ${selectedItem?.id === table.id ? 'selected' : ''}`}
                    onClick={() => handleSelectFromList(table.id, 'table')}
                    title={`Capacidad: ${table.capacity}`}
                  >
                    {table.type === 'round' ? '⭕' : '▭'} {table.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Elementos */}
          {layout.elements.length > 0 && (
            <div className="selector-group">
              <label className="group-label">Elementos:</label>
              <div className="chips-container">
                {layout.elements.map((element) => (
                  <button
                    key={element.id}
                    className={`element-chip ${selectedItem?.id === element.id ? 'selected' : ''}`}
                    onClick={() => handleSelectFromList(element.id, 'element')}
                    title={element.label}
                  >
                    {getElementIcon(element.type)} {element.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay elementos */}
          {layout.tables.length === 0 && layout.elements.length === 0 && (
            <div className="empty-selector">
              <p>No hay elementos en el canvas. Usa los botones de arriba para agregar mesas y elementos.</p>
            </div>
          )}
        </div>
      </div>

      <div className="editor-content-new">
        {/* Canvas Area */}
        <div className="canvas-area-new">
          <div className="canvas-info">
            <p>📍 Arrastra para posicionar • 👆 Click para seleccionar</p>
            <p>Mesas: {layout.tables.length} | Elementos: {layout.elements.length}</p>
          </div>
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            ref={stageRef}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedItem(null);
              }
            }}
          >
            <Layer>
              {layout.elements.map((element) => renderElement(element))}
              {layout.tables.map((table) => renderTable(table))}
            </Layer>
          </Stage>
        </div>

        {/* Panel lateral de propiedades */}
        {selectedItem && (
          <div className="properties-panel">
            <div className="panel-header-new">
              <h3>✏️ Propiedades</h3>
              <button className="close-panel" onClick={() => setSelectedItem(null)}>✕</button>
            </div>

            <div className="property-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={selectedItem.data.label}
                onChange={(e) => handleUpdateName(e.target.value)}
                placeholder="Nombre del elemento"
                maxLength={30}
              />
            </div>

            {selectedItem.type === 'table' && (
              <>
                <div className="property-group">
                  <label>Capacidad:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedItem.data.capacity}
                    onChange={(e) => handleUpdateSize('capacity', e.target.value)}
                  />
                </div>

                {selectedItem.data.type === 'round' ? (
                  <div className="property-group">
                    <label>Radio (px):</label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={selectedItem.data.radius || 40}
                      onChange={(e) => handleUpdateSize('radius', e.target.value)}
                    />
                    <span className="value-display">{selectedItem.data.radius || 40}px</span>
                  </div>
                ) : (
                  <>
                    <div className="property-group">
                      <label>Ancho (px):</label>
                      <input
                        type="range"
                        min="60"
                        max="200"
                        value={selectedItem.data.width || 120}
                        onChange={(e) => handleUpdateSize('width', e.target.value)}
                      />
                      <span className="value-display">{selectedItem.data.width || 120}px</span>
                    </div>
                    <div className="property-group">
                      <label>Alto (px):</label>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={selectedItem.data.height || 40}
                        onChange={(e) => handleUpdateSize('height', e.target.value)}
                      />
                      <span className="value-display">{selectedItem.data.height || 40}px</span>
                    </div>
                  </>
                )}
              </>
            )}

            {selectedItem.type === 'element' && (() => {
              const ranges = getSizeRanges(selectedItem.data.type, 'element');
              return (
                <>
                  <div className="property-group">
                    <label>Ancho (px):</label>
                    <input
                      type="range"
                      min={ranges.width.min}
                      max={ranges.width.max}
                      value={selectedItem.data.width || 150}
                      onChange={(e) => handleUpdateSize('width', e.target.value)}
                    />
                    <span className="value-display">{selectedItem.data.width || 150}px</span>
                  </div>
                  <div className="property-group">
                    <label>Alto (px):</label>
                    <input
                      type="range"
                      min={ranges.height.min}
                      max={ranges.height.max}
                      value={selectedItem.data.height || 80}
                      onChange={(e) => handleUpdateSize('height', e.target.value)}
                    />
                    <span className="value-display">{selectedItem.data.height || 80}px</span>
                  </div>

                  <div className="property-group">
                    <label>Color:</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        value={selectedItem.data.color || '#8A9B68'}
                        onChange={(e) => {
                          updateElement(selectedItem.id, { color: e.target.value });
                        }}
                        className="color-input"
                      />
                      <span className="color-value">{selectedItem.data.color || '#8A9B68'}</span>
                    </div>

                    {/* Colores preset */}
                    <div className="preset-colors">
                      {[
                        { name: 'Terracota', color: '#C1502E' },
                        { name: 'Morado', color: '#8B4789' },
                        { name: 'Coral', color: '#F08080' },
                        { name: 'Rosa', color: '#E8B4B8' },
                        { name: 'Dorado', color: '#D4AF37' },
                        { name: 'Verde', color: '#8A9B68' },
                        { name: 'Beige', color: '#F5F1E8' },
                        { name: 'Marrón', color: '#4A3C2F' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          className="preset-color-btn"
                          style={{ backgroundColor: preset.color }}
                          onClick={() => updateElement(selectedItem.id, { color: preset.color })}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="panel-actions">
              <button className="delete-button-new" onClick={handleDelete}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LayoutEditor;
