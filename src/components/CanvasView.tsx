import React, { useState, useRef, useCallback, useEffect } from "react";

interface CanvasViewProps {
  onClose: () => void;
}

interface CanvasCard {
  id: string;
  type: "text" | "note";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
}

interface CanvasEdge {
  id: string;
  from: string;
  to: string;
}

const CARD_COLORS = ["var(--accent-muted)", "#3a3f5c", "#3a5c45", "#5c4a3a", "#5c3a4a"];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CanvasView({ onClose }: CanvasViewProps) {
  const [cards, setCards] = useState<CanvasCard[]>(() => {
    const saved = localStorage.getItem("void-canvas-cards");
    return saved ? JSON.parse(saved) : [
      { id: generateId(), type: "text", x: 0, y: 0, width: 200, height: 120, content: "Central idea", color: CARD_COLORS[0] },
      { id: generateId(), type: "text", x: 260, y: -60, width: 180, height: 100, content: "Supporting thought", color: CARD_COLORS[1] },
      { id: generateId(), type: "text", x: -240, y: 40, width: 180, height: 100, content: "Another angle", color: CARD_COLORS[2] },
    ];
  });
  const [edges] = useState<CanvasEdge[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, cardX: 0, cardY: 0, offsetX: 0, offsetY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("void-canvas-cards", JSON.stringify(cards));
  }, [cards]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(3, Math.max(0.3, s * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".canvas-card")) return;
    setPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY, cardX: 0, cardY: 0, offsetX: offset.x, offsetY: offset.y };
  }, [offset]);

  const handleCardMouseDown = useCallback((e: React.MouseEvent, card: CanvasCard) => {
    e.stopPropagation();
    setDraggingCard(card.id);
    dragStart.current = { x: e.clientX, y: e.clientY, cardX: card.x, cardY: card.y, offsetX: 0, offsetY: 0 };
  }, []);

  useEffect(() => {
    if (!draggingCard && !panning) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingCard) {
        const dx = (e.clientX - dragStart.current.x) / scale;
        const dy = (e.clientY - dragStart.current.y) / scale;
        setCards((prev) => prev.map((c) => c.id === draggingCard ? { ...c, x: dragStart.current.cardX + dx, y: dragStart.current.cardY + dy } : c));
      } else if (panning) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setOffset({ x: dragStart.current.offsetX + dx, y: dragStart.current.offsetY + dy });
      }
    };
    const handleMouseUp = () => {
      setDraggingCard(null);
      setPanning(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingCard, panning, scale]);

  const addCard = (type: CanvasCard["type"]) => {
    const id = generateId();
    setCards((prev) => [...prev, {
      id,
      type,
      x: -offset.x / scale + 40,
      y: -offset.y / scale + 40,
      width: type === "note" ? 220 : 180,
      height: type === "note" ? 140 : 100,
      content: type === "note" ? "[[Untitled]]" : "New card",
      color: CARD_COLORS[prev.length % CARD_COLORS.length],
    }]);
  };

  const updateCard = (id: string, patch: Partial<CanvasCard>) => {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="canvas-view">
      <div className="canvas-header">
        <h3 className="canvas-title">Canvas</h3>
        <div className="canvas-toolbar">
          <button className="btn-secondary" onClick={() => addCard("text")}>+ Text</button>
          <button className="btn-secondary" onClick={() => addCard("note")}>+ Note</button>
          <button className="btn-secondary" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>Reset</button>
          <span className="canvas-zoom">{Math.round(scale * 100)}%</span>
        </div>
        <button className="btn-icon" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div
        ref={containerRef}
        className="canvas-content"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <div
          className="canvas-world"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg className="canvas-edges">
            {edges.map((edge) => {
              const from = cards.find((c) => c.id === edge.from);
              const to = cards.find((c) => c.id === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={edge.id}
                  x1={from.x + from.width / 2}
                  y1={from.y + from.height / 2}
                  x2={to.x + to.width / 2}
                  y2={to.y + to.height / 2}
                  stroke="var(--border)"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          {cards.map((card) => (
            <div
              key={card.id}
              className="canvas-card"
              style={{
                left: card.x,
                top: card.y,
                width: card.width,
                height: card.height,
                background: card.color,
              }}
              onMouseDown={(e) => handleCardMouseDown(e, card)}
            >
              <textarea
                className="canvas-card-text"
                value={card.content}
                onChange={(e) => updateCard(card.id, { content: e.target.value })}
                spellCheck={false}
              />
              <button className="canvas-card-delete" onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}>&times;</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
