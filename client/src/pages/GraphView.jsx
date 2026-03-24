import React, { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useNavigate } from "react-router-dom";
import { fetchGraph } from "../api/graph.api";
import { useTheme } from "../hooks/useTheme";
import Loader from "../components/ui/Loader";

const GraphView = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const getGraph = async () => {
      try {
        const res = await fetchGraph();

        const formatted = {
          nodes: res.data.nodes.map((node) => ({
            id: node._id,
            name: node.title,
            val: 3
          })),
          links: res.data.edges.map((edge) => ({
            source: edge.from,
            target: edge.to
          }))
        };

        setGraphData(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getGraph();
  }, []);

  useEffect(() => {
    if (!loading && fgRef.current) {
      fgRef.current.d3Force("charge").strength(-200);
      fgRef.current.d3Force("link").distance(120);
    }
  }, [loading]);

  if (loading) {
        return (
            <div style={{
                position: "absolute",
                inset: 0,
                top: "50%",
                left: "56%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden"
            }}>
                <Loader />
            </div>
        );
    }

  const graphBg = theme === 'dark' ? '#121212' : '#ffffff';
  const linkColor = theme === 'dark' ? '#4a4a60' : '#d1d5db';

  return (
    <div className="w-full h-full">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node) => node.name}
        nodeAutoColorBy="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkWidth={1.5}
        backgroundColor={graphBg}
        linkColor={() => linkColor}
        onNodeClick={(node) => navigate(`/content/${node.id}`)}
      />
    </div>
  );
};

export default GraphView;