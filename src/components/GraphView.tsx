import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface GraphViewProps {
  notes: string[];
  backlinks: Map<string, string[]>;
  activeNote: string | null;
  onNodeClick: (note: string) => void;
  onClose: () => void;
}

interface GraphNode {
  id: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const NODE_COLORS = ["#8a70d6", "#5c8bd6", "#70d6a6", "#d6a670", "#d6708e", "#70c4d6"];

function colorForNode(id: string): string {
  const depth = id.split("/").length - 1;
  return NODE_COLORS[depth % NODE_COLORS.length];
}

export default function GraphView({ notes, backlinks, activeNote, onNodeClick, onClose }: GraphViewProps) {
  const graphRef = useRef<any>(null);
  const [localMode, setLocalMode] = useState(false);
  const [showOrphans, setShowOrphans] = useState(true);
  const [showArrows, setShowArrows] = useState(false);
  const [nodeSize, setNodeSize] = useState(4);
  const [linkWidth, setLinkWidth] = useState(1);
  const [centerStrength, setCenterStrength] = useState(0.05);
  const [repelStrength, setRepelStrength] = useState(-300);
  const [linkDistance, setLinkDistance] = useState(100);
  const [search, setSearch] = useState("");

  const fullData: GraphData = useMemo(() => {
    const nodes: GraphNode[] = notes.map((id) => ({ id, val: nodeSize, color: colorForNode(id) }));
    const links: GraphLink[] = [];
    const linkSet = new Set<string>();
    for (const [target, sources] of backlinks.entries()) {
      for (const source of sources) {
        if (!notes.includes(source) || !notes.includes(target)) continue;
        const key = [source, target].sort().join("->");
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({ source, target });
        }
      }
    }
    return { nodes, links };
  }, [notes, backlinks, nodeSize]);

  const visibleData: GraphData = useMemo(() => {
    let nodes = fullData.nodes;
    let links = fullData.links;

    if (localMode && activeNote) {
      const neighborIds = new Set<string>([activeNote]);
      for (const link of links) {
        const s = typeof link.source === "string" ? link.source : (link.source as any).id;
        const t = typeof link.target === "string" ? link.target : (link.target as any).id;
        if (s === activeNote) neighborIds.add(t);
        if (t === activeNote) neighborIds.add(s);
      }
      nodes = nodes.filter((n) => neighborIds.has(n.id));
      links = links.filter((l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as any).id;
        const t = typeof l.target === "string" ? l.target : (l.target as any).id;
        return neighborIds.has(s) && neighborIds.has(t);
      });
    }

    if (!showOrphans) {
      const linkedIds = new Set<string>();
      for (const link of links) {
        linkedIds.add(typeof link.source === "string" ? link.source : (link.source as any).id);
        linkedIds.add(typeof link.target === "string" ? link.target : (link.target as any).id);
      }
      nodes = nodes.filter((n) => linkedIds.has(n.id));
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      nodes = nodes.filter((n) => n.id.toLowerCase().includes(query));
    }

    return { nodes, links };
  }, [fullData, localMode, activeNote, showOrphans, search]);

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge")?.strength(repelStrength);
      graphRef.current.d3Force("link")?.distance(linkDistance);
      graphRef.current.d3Force("center")?.strength(centerStrength);
      graphRef.current.d3ReheatSimulation();
    }
  }, [repelStrength, linkDistance, centerStrength]);

  return (
    <div className="graph-view">
      <div className="graph-header">
        <h3 className="graph-title">Graph View</h3>
        <button className="btn-icon" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="graph-toolbar">
        <input
          className="graph-search"
          placeholder="Filter nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="graph-toggle">
          <input type="checkbox" checked={localMode} onChange={(e) => setLocalMode(e.target.checked)} />
          Local
        </label>
        <label className="graph-toggle">
          <input type="checkbox" checked={showOrphans} onChange={(e) => setShowOrphans(e.target.checked)} />
          Orphans
        </label>
        <label className="graph-toggle">
          <input type="checkbox" checked={showArrows} onChange={(e) => setShowArrows(e.target.checked)} />
          Arrows
        </label>
        <div className="graph-control">
          <span>Node size</span>
          <input type="range" min="2" max="12" value={nodeSize} onChange={(e) => setNodeSize(Number(e.target.value))} />
        </div>
        <div className="graph-control">
          <span>Link width</span>
          <input type="range" min="1" max="6" value={linkWidth} onChange={(e) => setLinkWidth(Number(e.target.value))} />
        </div>
        <div className="graph-control">
          <span>Repel</span>
          <input type="range" min="-1000" max="-50" value={repelStrength} onChange={(e) => setRepelStrength(Number(e.target.value))} />
        </div>
        <div className="graph-control">
          <span>Link dist</span>
          <input type="range" min="30" max="300" value={linkDistance} onChange={(e) => setLinkDistance(Number(e.target.value))} />
        </div>
        <div className="graph-control">
          <span>Center</span>
          <input type="range" min="0" max="20" value={Math.round(centerStrength * 100)} onChange={(e) => setCenterStrength(Number(e.target.value) / 100)} />
        </div>
      </div>
      <div className="graph-canvas">
        {visibleData.nodes.length === 0 ? (
          <div className="graph-empty">No notes match the current filters.</div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={visibleData}
            nodeLabel="id"
            nodeColor={(node: any) => node.id === activeNote ? "#ffcc00" : node.color}
            nodeVal={(node: any) => node.id === activeNote ? node.val * 1.5 : node.val}
            linkDirectionalArrowLength={showArrows ? 6 : 0}
            linkDirectionalArrowRelPos={1}
            linkWidth={linkWidth}
            backgroundColor="rgba(0,0,0,0)"
            onNodeClick={handleNodeClick}
            width={undefined}
            height={undefined}
            warmupTicks={10}
            cooldownTicks={50}
          />
        )}
      </div>
    </div>
  );
}
