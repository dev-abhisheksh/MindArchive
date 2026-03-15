import React, { useEffect, useState, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { useNavigate } from "react-router-dom";
import { fetchGraph } from "../api/graph.api";

const GraphView = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();
  const navigate = useNavigate();

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
      <div className="h-full flex items-center justify-center">
        Loading graph...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node) => node.name}
        nodeAutoColorBy="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkWidth={1.5}
        backgroundColor="#000000"
        onNodeClick={(node) => navigate(`/content/${node.id}`)}
      />
    </div>
  );
};

export default GraphView;