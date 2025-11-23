import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stage, Layer, Circle, Rect, Text, Group, Arc } from 'react-konva';
import { motion } from 'framer-motion';
import useSeatingStore from '../store/seatingStore';
import '../styles/SeatingChart.css';

function SeatingChartPage() {
  const [searchParams] = useSearchParams();
  const guestId = searchParams.get('id');

  const { layout, assignments, loadLayout, loadAssignments, isLoading } = useSeatingStore();
  const [guestTable, setGuestTable] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [isPortrait, setIsPortrait] = useState(false);
  const [showRotateHint, setShowRotateHint] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const lastCenter = useRef(null);
  const lastDist = useRef(0);

  useEffect(() => {
    // Cargar datos al montar el componente
    loadLayout();
    loadAssignments();
  }, [loadLayout, loadAssignments]);

  useEffect(() => {
    // Encontrar la mesa del invitado
    if (guestId && assignments.length > 0) {
      const assignment = assignments.find(a => a.guestId === guestId);
      if (assignment) {
        const table = layout.tables.find(t => t.id === assignment.tableId);
        setGuestTable(table);
      }
    }
  }, [guestId, assignments, layout]);

  // Funciones de zoom y pan
  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    const clampedScale = Math.max(0.5, Math.min(3, newScale));

    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleTouchMove = (e) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = stageRef.current;
    if (!stage) return;

    if (touch1 && touch2) {
      // Pinch to zoom
      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };
      const newCenter = getCenter(p1, p2);
      const dist = getDistance(p1, p2);

      if (lastDist.current === 0) {
        lastDist.current = dist;
        lastCenter.current = newCenter;
        return;
      }

      const pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleY(),
      };

      const scale = stage.scaleX() * (dist / lastDist.current);
      const clampedScale = Math.max(0.5, Math.min(3, scale));

      setStageScale(clampedScale);
      setStagePosition({
        x: newCenter.x - pointTo.x * clampedScale,
        y: newCenter.y - pointTo.y * clampedScale,
      });

      lastDist.current = dist;
      lastCenter.current = newCenter;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
  };

  const handleZoomIn = () => {
    const newScale = Math.min(3, stageScale * 1.2);
    setStageScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.5, stageScale / 1.2);
    setStageScale(newScale);
  };

  const handleResetZoom = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    // Detectar orientación y ajustar canvas
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = 800 / 1200; // Original aspect ratio (height/width)
        const isPortraitMode = window.innerHeight > window.innerWidth;
        const isMobile = window.innerWidth <= 768;

        setIsPortrait(isPortraitMode && isMobile);

        if (isPortraitMode && isMobile) {
          // En modo portrait mobile: mantener tamaño fijo para scroll horizontal
          setStageSize({ width: 1200, height: 800 });
          // Mostrar hint solo la primera vez
          setTimeout(() => setShowRotateHint(true), 1000);
        } else {
          // En landscape o desktop: ajustar al contenedor
          const width = Math.min(containerWidth, 1200);
          const height = width * aspectRatio;
          setStageSize({ width, height });
          setShowRotateHint(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const renderTable = (table, isHighlighted) => {
    const scale = stageSize.width / 1200; // Escala basada en el ancho del stage
    const x = table.position.x * scale;
    const y = table.position.y * scale;
    const rotation = table.rotation || 0;

    if (table.type === 'round') {
      const radius = (table.radius || 40) * scale;
      return (
        <Group key={table.id} x={x} y={y} rotation={rotation}>
          <Circle
            radius={radius}
            fill={isHighlighted ? '#C1502E' : '#F5F1E8'}
            stroke={isHighlighted ? '#8B4789' : '#D4AF37'}
            strokeWidth={isHighlighted ? 4 : 2}
            shadowBlur={isHighlighted ? 20 : 5}
            shadowColor={isHighlighted ? '#C1502E' : '#000'}
            shadowOpacity={isHighlighted ? 0.6 : 0.2}
          />
          <Text
            text={table.label}
            fontSize={14 * scale}
            fontFamily="Playfair Display"
            fill={isHighlighted ? 'white' : '#4A3C2F'}
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            offsetX={radius * 0.75}
            offsetY={7 * scale}
            width={radius * 1.5}
          />
        </Group>
      );
    } else {
      // Mesa rectangular (tablón)
      const width = (table.width || 120) * scale;
      const height = (table.height || 40) * scale;
      return (
        <Group key={table.id} x={x} y={y} rotation={rotation}>
          <Rect
            width={width}
            height={height}
            fill={isHighlighted ? '#C1502E' : '#F5F1E8'}
            stroke={isHighlighted ? '#8B4789' : '#D4AF37'}
            strokeWidth={isHighlighted ? 4 : 2}
            cornerRadius={10 * scale}
            shadowBlur={isHighlighted ? 20 : 5}
            shadowColor={isHighlighted ? '#C1502E' : '#000'}
            shadowOpacity={isHighlighted ? 0.6 : 0.2}
          />
          <Text
            text={table.label}
            fontSize={14 * scale}
            fontFamily="Playfair Display"
            fill={isHighlighted ? 'white' : '#4A3C2F'}
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            x={0}
            y={height / 2 - (7 * scale)}
            width={width}
          />
        </Group>
      );
    }
  };

  const renderElement = (element) => {
    const scale = stageSize.width / 1200;
    const x = element.position.x * scale;
    const y = element.position.y * scale;
    const width = (element.width || 100) * scale;
    const height = (element.height || 100) * scale;
    const rotation = element.rotation || 0;

    // Use custom color if available, otherwise use default colors
    let fill = element.color || '#8A9B68'; // Default sage color

    // Only use switch if no custom color is set
    if (!element.color) {
      switch (element.type) {
        case 'bar':
          fill = '#F08080';
          break;
        case 'bathroom':
          fill = '#E8B4B8';
          break;
        case 'garden':
          fill = '#8A9B68';
          break;
        case 'games':
          fill = '#D4AF37';
          break;
        case 'entrance':
          fill = '#8B4789';
          break;
        case 'wall':
          fill = '#4A3C2F';
          break;
        case 'arch':
          fill = '#D4AF37';
          break;
        case 'tree':
          fill = '#2F5233';
          break;
        case 'stage':
          fill = '#4A3C2F';
          break;
        case 'dancefloor':
          fill = '#F5F1E8';
          break;
        case 'fountain':
          fill = '#87CEEB';
          break;
        case 'altar':
          fill = '#F5DEB3';
          break;
      }
    }

    // Special rendering for tree (circle + trunk)
    if (element.type === 'tree') {
      const radius = Math.min(width, height) / 2;
      const trunkWidth = radius * 0.3;
      const trunkHeight = radius * 0.6;

      return (
        <Group key={element.id} x={x} y={y} rotation={rotation}>
          {/* Tree top (circle) */}
          <Circle
            x={width / 2}
            y={radius}
            radius={radius}
            fill={fill}
            opacity={0.7}
            stroke="#4A3C2F"
            strokeWidth={1}
          />
          {/* Tree trunk */}
          <Rect
            x={width / 2 - trunkWidth / 2}
            y={radius + radius * 0.6}
            width={trunkWidth}
            height={trunkHeight}
            fill="#4A3C2F"
            opacity={0.8}
            cornerRadius={2 * scale}
          />
          <Text
            text={element.label}
            fontSize={10 * scale}
            fontFamily="Montserrat"
            fill="#4A3C2F"
            fontStyle="bold"
            align="center"
            verticalAlign="top"
            width={width}
            y={radius * 2.2 + 5 * scale}
          />
        </Group>
      );
    }

    // Special rendering for arch with real curves
    if (element.type === 'arch') {
      const pillarWidth = Math.max(width * 0.15, 10 * scale);
      const pillarHeight = height * 0.8;
      const archRadius = width / 2;
      const archThickness = Math.max(width * 0.1, 8 * scale);

      return (
        <Group key={element.id} x={x} y={y} rotation={rotation}>
          {/* Left pillar */}
          <Rect
            x={0}
            y={height - pillarHeight}
            width={pillarWidth}
            height={pillarHeight}
            fill={fill}
            opacity={0.7}
            cornerRadius={3 * scale}
            stroke="#4A3C2F"
            strokeWidth={2}
          />

          {/* Right pillar */}
          <Rect
            x={width - pillarWidth}
            y={height - pillarHeight}
            width={pillarWidth}
            height={pillarHeight}
            fill={fill}
            opacity={0.7}
            cornerRadius={3 * scale}
            stroke="#4A3C2F"
            strokeWidth={2}
          />

          {/* Semicircular arch on top */}
          <Arc
            x={width / 2}
            y={height - pillarHeight}
            innerRadius={archRadius - archThickness}
            outerRadius={archRadius}
            angle={180}
            rotation={180}
            fill={fill}
            opacity={0.7}
            stroke="#4A3C2F"
            strokeWidth={2}
          />

          <Text
            text={element.label}
            fontSize={11 * scale}
            fontFamily="Montserrat"
            fill="#4A3C2F"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            width={width}
            y={height - pillarHeight / 2 - 6 * scale}
          />
        </Group>
      );
    }

    // Special rendering for wall (thick line)
    if (element.type === 'wall') {
      return (
        <Group key={element.id} x={x} y={y} rotation={rotation}>
          <Rect
            width={width}
            height={height}
            fill={fill}
            opacity={0.9}
            cornerRadius={2 * scale}
            stroke="#2F2520"
            strokeWidth={2}
          />
          <Text
            text={element.label}
            fontSize={10 * scale}
            fontFamily="Montserrat"
            fill="white"
            fontStyle="bold"
            align="center"
            verticalAlign="middle"
            width={width}
            y={height / 2 - 6 * scale}
          />
        </Group>
      );
    }

    // Standard rendering for other elements
    return (
      <Group key={element.id} x={x} y={y} rotation={rotation}>
        <Rect
          width={width}
          height={height}
          fill={fill}
          opacity={0.6}
          cornerRadius={5 * scale}
          stroke="#4A3C2F"
          strokeWidth={1}
        />
        <Text
          text={element.label}
          fontSize={12 * scale}
          fontFamily="Montserrat"
          fill="#4A3C2F"
          fontStyle="bold"
          align="center"
          verticalAlign="middle"
          width={width}
          y={height / 2 - 8 * scale}
        />
      </Group>
    );
  };

  if (isLoading) {
    return (
      <div className="seating-chart-page">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Cargando croquis...</p>
        </div>
      </div>
    );
  }

  if (!guestId) {
    return (
      <div className="seating-chart-page">
        <div className="seating-container">
          <h1>Croquis del Salón</h1>
          <p className="error-message">
            ⚠️ No se proporcionó un ID de invitado. Por favor usa el link personalizado que recibiste.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="seating-chart-page">
      <motion.div
        className="seating-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Tu Mesa Asignada</h1>

        {guestTable ? (
          <>
            <div className="guest-info">
              <p className="table-name">
                🎉 Te sentarás en: <strong>{guestTable.label}</strong>
              </p>
              <p className="capacity-info">
                Capacidad de la mesa: {guestTable.capacity} personas
              </p>
            </div>

            {showRotateHint && isPortrait && (
              <motion.div
                className="rotate-hint"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="rotate-icon">📱</span>
                <p>Usa dos dedos para hacer zoom o rota tu teléfono horizontalmente para una mejor visualización</p>
                <button onClick={() => setShowRotateHint(false)} className="close-hint">✕</button>
              </motion.div>
            )}

            <div className={`canvas-wrapper ${isPortrait ? 'portrait-scroll' : ''}`} ref={containerRef}>
              <div className="zoom-controls">
                <button className="zoom-btn" onClick={handleZoomIn} title="Acercar">+</button>
                <button className="zoom-btn" onClick={handleZoomOut} title="Alejar">−</button>
                <button className="zoom-btn reset" onClick={handleResetZoom} title="Restablecer">⟲</button>
              </div>
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                ref={stageRef}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                draggable
                onWheel={handleWheel}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDragEnd={(e) => {
                  setStagePosition({
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              >
                <Layer>
                  {/* Renderizar todos los elementos decorativos */}
                  {layout.elements.map(element => renderElement(element))}

                  {/* Renderizar todas las mesas */}
                  {layout.tables.map(table =>
                    renderTable(table, table.id === guestTable.id)
                  )}
                </Layer>
              </Stage>
            </div>

            <div className="legend">
              <h3>Leyenda</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#C1502E' }}></div>
                  <span>Tu mesa</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#F5F1E8', border: '2px solid #D4AF37' }}></div>
                  <span>Otras mesas</span>
                </div>
                {layout.elements.some(e => e.type === 'bar') && (
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#F08080' }}></div>
                    <span>Barra de bebidas</span>
                  </div>
                )}
                {layout.elements.some(e => e.type === 'bathroom') && (
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#E8B4B8' }}></div>
                    <span>Baños</span>
                  </div>
                )}
                {layout.elements.some(e => e.type === 'garden') && (
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#8A9B68' }}></div>
                    <span>Jardín</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="no-assignment">
            <p>⏳ Aún no tienes una mesa asignada.</p>
            <p>Por favor contacta a los organizadores para más información.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SeatingChartPage;
