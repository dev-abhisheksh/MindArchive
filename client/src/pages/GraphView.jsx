import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { fetchGraph } from "../api/graph.api";
import { useTheme } from "../hooks/useTheme";
import Loader from "../components/ui/Loader";
import { Search, ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import "./GraphView.css";

// ── Cluster Palettes ────────────────────────────────────
const LIGHT_PALETTE = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];
const DARK_PALETTE = [
  "#818cf8", "#fb7185", "#34d399", "#fbbf24", "#a78bfa",
  "#22d3ee", "#f472b6", "#2dd4bf", "#fb923c", "#a3e635",
];

// ── Helpers ─────────────────────────────────────────────
function getPrimaryTag(tags) {
  if (!tags || tags.length === 0) return "__none__";
  return tags[0].toLowerCase();
}

function buildAdjacency(links) {
  const adj = {};
  links.forEach(({ source, target }) => {
    const s = typeof source === "object" ? source.id : source;
    const t = typeof target === "object" ? target.id : target;
    if (!adj[s]) adj[s] = new Set();
    if (!adj[t]) adj[t] = new Set();
    adj[s].add(t);
    adj[t].add(s);
  });
  return adj;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.4, g: 0.4, b: 1 };
}

// ── Sprite texture for glow effect ──────────────────────
function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.6)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.2)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.05)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Cache materials to avoid re-creating per frame
const materialCache = new Map();
const glowTexture = createGlowTexture();

function getNodeMaterials(color, isHighlighted, isFaded) {
  const key = `${color}-${isHighlighted}-${isFaded}`;
  if (materialCache.has(key)) return materialCache.get(key);

  const rgb = hexToRgb(color);
  const opacity = isFaded ? 0.1 : 1;
  const emissiveIntensity = isHighlighted ? 0.8 : 0.3;

  const sphereMat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(rgb.r, rgb.g, rgb.b),
    emissive: new THREE.Color(rgb.r * 0.5, rgb.g * 0.5, rgb.b * 0.5),
    emissiveIntensity,
    transparent: true,
    opacity,
    shininess: 80,
  });

  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture,
    color: new THREE.Color(rgb.r, rgb.g, rgb.b),
    transparent: true,
    opacity: isFaded ? 0.03 : isHighlighted ? 0.5 : 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const result = { sphereMat, glowMat };
  materialCache.set(key, result);
  return result;
}

// ── Geometry (shared) ───────────────────────────────────
const sphereGeo = new THREE.SphereGeometry(1, 20, 20);

const GraphView = () => {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const fgRef = useRef();
  const containerRef = useRef();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // ── Resize observer ───────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Fetch graph data ──────────────────────────────────
  useEffect(() => {
    const getGraph = async () => {
      try {
        const res = await fetchGraph();
        setRawData(res.data);
      } catch (err) {
        console.error("Failed to fetch graph:", err);
      } finally {
        setLoading(false);
      }
    };
    getGraph();
  }, []);

  // ── Derive: clusters, colors, graph data ──────────────
  const { graphData, clusterColors, clusterNames } = useMemo(() => {
    if (!rawData)
      return { graphData: { nodes: [], links: [] }, clusterColors: {}, clusterNames: [] };

    const palette = theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
    const clusterSet = new Set();
    rawData.nodes.forEach((n) => clusterSet.add(getPrimaryTag(n.tags)));
    const uniqueClusters = [...clusterSet];
    const colorMap = {};
    uniqueClusters.forEach((c, i) => {
      colorMap[c] = palette[i % palette.length];
    });

    const nodes = rawData.nodes.map((node) => {
      const cluster = getPrimaryTag(node.tags);
      return {
        id: node._id,
        name: node.title || "Untitled",
        type: node.type || "article",
        tags: node.tags || [],
        cluster,
        color: colorMap[cluster],
      };
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = rawData.edges
      .filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to))
      .map((edge) => ({
        source: edge.from,
        target: edge.to,
        score: edge.score || 0,
      }));

    return {
      graphData: { nodes, links },
      clusterColors: colorMap,
      clusterNames: uniqueClusters.filter((c) => c !== "__none__"),
    };
  }, [rawData, theme]);

  // ── Adjacency for highlight logic ─────────────────────
  const adjacency = useMemo(() => buildAdjacency(graphData.links), [graphData.links]);

  const highlightSet = useMemo(() => {
    if (!selectedNode) return null;
    const set = new Set([selectedNode]);
    const neighbors = adjacency[selectedNode];
    if (neighbors) neighbors.forEach((n) => set.add(n));
    return set;
  }, [selectedNode, adjacency]);

  // ── Search ────────────────────────────────────────────
  const searchMatchId = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const match = graphData.nodes.find(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
    return match ? match.id : null;
  }, [searchQuery, graphData.nodes]);

  useEffect(() => {
    if (searchMatchId && fgRef.current) {
      const node = graphData.nodes.find((n) => n.id === searchMatchId);
      if (node && node.x !== undefined) {
        fgRef.current.cameraPosition(
          { x: node.x, y: node.y, z: node.z + 120 },
          { x: node.x, y: node.y, z: node.z },
          800
        );
        setSelectedNode(searchMatchId);
      }
    }
  }, [searchMatchId]);

  // ── Configure forces ──────────────────────────────────
  useEffect(() => {
    if (!loading && fgRef.current) {
      const fg = fgRef.current;
      fg.d3Force("charge").strength(-80);
      fg.d3Force("link").distance((link) => {
        const score = link.score || 0;
        return 50 + (1 - score) * 80;
      });

      // Custom cluster gravity force
      const clusterCentroids = {};

      fg.d3Force("cluster", (alpha) => {
        // Calculate centroids
        Object.keys(clusterCentroids).forEach((k) => delete clusterCentroids[k]);
        const counts = {};
        graphData.nodes.forEach((node) => {
          if (node.x === undefined) return;
          const c = node.cluster;
          if (!clusterCentroids[c]) {
            clusterCentroids[c] = { x: 0, y: 0, z: 0 };
            counts[c] = 0;
          }
          clusterCentroids[c].x += node.x;
          clusterCentroids[c].y += node.y;
          clusterCentroids[c].z += node.z || 0;
          counts[c]++;
        });
        Object.keys(clusterCentroids).forEach((c) => {
          clusterCentroids[c].x /= counts[c];
          clusterCentroids[c].y /= counts[c];
          clusterCentroids[c].z /= counts[c];
        });

        // Pull nodes toward cluster centroid
        const strength = alpha * 0.3;
        graphData.nodes.forEach((node) => {
          if (node.x === undefined) return;
          const centroid = clusterCentroids[node.cluster];
          if (!centroid) return;
          node.vx = (node.vx || 0) + (centroid.x - node.x) * strength;
          node.vy = (node.vy || 0) + (centroid.y - node.y) * strength;
          node.vz = (node.vz || 0) + ((centroid.z || 0) - (node.z || 0)) * strength;
        });
      });
    }
  }, [loading, graphData.nodes]);

  // ── Scene setup (lights) ──────────────────────────────
  useEffect(() => {
    if (!loading && fgRef.current) {
      const scene = fgRef.current.scene();
      // Remove existing custom lights
      const toRemove = [];
      scene.traverse((obj) => {
        if (obj.userData?.customLight) toRemove.push(obj);
      });
      toRemove.forEach((obj) => scene.remove(obj));

      // Add ambient + directional lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      ambient.userData.customLight = true;
      scene.add(ambient);

      const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dir1.position.set(100, 200, 150);
      dir1.userData.customLight = true;
      scene.add(dir1);

      const dir2 = new THREE.DirectionalLight(0x8888ff, 0.3);
      dir2.position.set(-100, -100, -100);
      dir2.userData.customLight = true;
      scene.add(dir2);
    }
  }, [loading, theme]);

  // ── Theme colors ──────────────────────────────────────
  const bgColor = useMemo(
    () => (theme === "dark" ? "#0f0f0f" : "#fafafa"),
    [theme]
  );

  // ── 3D Node renderer ─────────────────────────────────
  const renderNode = useCallback(
    (node) => {
      const isSelected = selectedNode === node.id;
      const isSearchMatch = searchMatchId === node.id;
      const isNeighbour = highlightSet && highlightSet.has(node.id);
      const isFaded = highlightSet && !isNeighbour;
      const isHighlighted = isSelected || isSearchMatch;

      const baseSize = 3.5;
      const size = isHighlighted ? baseSize * 1.5 : baseSize;

      const { sphereMat, glowMat } = getNodeMaterials(
        node.color || "#6366f1",
        isHighlighted,
        isFaded
      );

      const group = new THREE.Group();

      // Core sphere
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.scale.set(size, size, size);
      group.add(mesh);

      // Glow sprite
      const sprite = new THREE.Sprite(glowMat);
      const glowSize = isHighlighted ? size * 5 : size * 3;
      sprite.scale.set(glowSize, glowSize, 1);
      group.add(sprite);

      return group;
    },
    [selectedNode, searchMatchId, highlightSet]
  );

  // ── Link styling ──────────────────────────────────────
  const getLinkWidth = useCallback((link) => {
    return 0.3 + (link.score || 0) * 2.5;
  }, []);

  const getLinkColor = useCallback(
    (link) => {
      const src = typeof link.source === "object" ? link.source.id : link.source;
      const tgt = typeof link.target === "object" ? link.target.id : link.target;
      const isHighlighted =
        highlightSet &&
        (selectedNode === src || selectedNode === tgt) &&
        highlightSet.has(src) &&
        highlightSet.has(tgt);
      const isFaded = highlightSet && !isHighlighted;

      if (isFaded) {
        return theme === "dark" ? "rgba(60,60,60,0.06)" : "rgba(200,200,200,0.06)";
      }
      if (isHighlighted) {
        return theme === "dark" ? "rgba(129,140,248,0.7)" : "rgba(99,102,241,0.6)";
      }
      return theme === "dark" ? "rgba(80,80,100,0.35)" : "rgba(180,180,200,0.4)";
    },
    [highlightSet, selectedNode, theme]
  );

  const getLinkParticles = useCallback(
    (link) => {
      const src = typeof link.source === "object" ? link.source.id : link.source;
      const tgt = typeof link.target === "object" ? link.target.id : link.target;
      if (highlightSet && highlightSet.has(src) && highlightSet.has(tgt)) {
        return 3;
      }
      return 0;
    },
    [highlightSet]
  );

  // ── Event handlers ────────────────────────────────────
  const handleNodeClick = useCallback(
    (node) => {
      if (selectedNode === node.id) {
        navigate(`/content/${node.id}`);
      } else {
        setSelectedNode(node.id);
        // Fly camera toward node
        if (fgRef.current) {
          const distance = 120;
          fgRef.current.cameraPosition(
            { x: node.x, y: node.y, z: (node.z || 0) + distance },
            { x: node.x, y: node.y, z: node.z || 0 },
            600
          );
        }
      }
    },
    [selectedNode, navigate]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setHoveredNode(null);
  }, []);

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node ? node.id : null);
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  // ── Zoom controls ─────────────────────────────────────
  const zoomIn = () => {
    if (!fgRef.current) return;
    const cam = fgRef.current.camera();
    const pos = cam.position;
    fgRef.current.cameraPosition(
      { x: pos.x * 0.7, y: pos.y * 0.7, z: pos.z * 0.7 },
      undefined, 300
    );
  };
  const zoomOut = () => {
    if (!fgRef.current) return;
    const cam = fgRef.current.camera();
    const pos = cam.position;
    fgRef.current.cameraPosition(
      { x: pos.x * 1.4, y: pos.y * 1.4, z: pos.z * 1.4 },
      undefined, 300
    );
  };
  const resetView = () => {
    if (!fgRef.current) return;
    fgRef.current.cameraPosition({ x: 0, y: 0, z: 350 }, { x: 0, y: 0, z: 0 }, 800);
  };

  // ── Node label (for tooltip) ──────────────────────────
  const getNodeLabel = useCallback((node) => {
    const tagsHtml =
      node.tags && node.tags.length > 0
        ? `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:3px">${node.tags
            .slice(0, 4)
            .map(
              (t) =>
                `<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:4px;background:rgba(99,102,241,0.15);color:#818cf8">#${t}</span>`
            )
            .join("")}</div>`
        : "";
    return `<div style="padding:8px 12px;border-radius:8px;background:rgba(20,20,20,0.92);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(8px);max-width:220px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:13px;font-weight:700;color:#f0f0f0;line-height:1.3;margin-bottom:2px">${node.name}</div>
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#888">${node.type}</div>
      ${tagsHtml}
    </div>`;
  }, []);

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="graph-container" ref={containerRef}>
      {/* Search */}
      <div className="graph-search">
        <Search size={14} className="graph-search-icon" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="graph-stats">
        <div className="graph-stat-badge">
          <span className="dot" style={{ background: "#6366f1" }} />
          {graphData.nodes.length} nodes
        </div>
        <div className="graph-stat-badge">
          <span className="dot" style={{ background: "#f59e0b" }} />
          {graphData.links.length} edges
        </div>
      </div>

      {/* Controls */}
      <div className="graph-controls">
        <button onClick={zoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} title="Reset View">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Legend */}
      {clusterNames.length > 0 && (
        <div className="graph-legend">
          <div className="graph-legend-title">Clusters</div>
          {clusterNames.slice(0, 8).map((name) => (
            <div key={name} className="graph-legend-item">
              <span className="swatch" style={{ background: clusterColors[name] }} />
              {name}
            </div>
          ))}
          {clusterNames.length > 8 && (
            <div className="graph-legend-item" style={{ color: "var(--text-muted)" }}>
              +{clusterNames.length - 8} more
            </div>
          )}
        </div>
      )}

      {/* 3D Force Graph */}
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
        backgroundColor={bgColor}
        showNavInfo={false}
        // Node rendering
        nodeThreeObject={renderNode}
        nodeThreeObjectExtend={false}
        nodeLabel={getNodeLabel}
        // Link rendering
        linkWidth={getLinkWidth}
        linkColor={getLinkColor}
        linkOpacity={1}
        linkCurvature={0.2}
        linkCurveRotation={0.5}
        linkDirectionalParticles={getLinkParticles}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleColor={() =>
          theme === "dark" ? "#818cf8" : "#6366f1"
        }
        // Interactions
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        enableNodeDrag={true}
        enableNavigationControls={true}
        enablePointerInteraction={true}
        // Performance
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.35}
        warmupTicks={60}
        cooldownTime={5000}
        rendererConfig={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      />
    </div>
  );
};

export default GraphView;