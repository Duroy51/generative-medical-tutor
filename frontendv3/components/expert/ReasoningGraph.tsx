"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// Configuration du layout automatique (Dagre)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[]) => {
    dagreGraph.setGraph({ rankdir: 'LR' }); // Left to Right

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 180, height: 50 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - 90,
            y: nodeWithPosition.y - 25,
        };
        return node;
    });

    return { nodes: layoutedNodes, edges };
};

export function ReasoningGraph({ data }: { data: any }) {
    // Transformation des données brutes en format ReactFlow
    const initialNodes = data?.nodes?.map((n: any) => ({
        id: n.id,
        data: { label: n.label },
        position: { x: 0, y: 0 }, // Sera calculé par Dagre
        style: {
            background: n.type === 'diagnosis' ? '#dcfce7' : n.type === 'symptom' ? '#fff' : '#fef9c3',
            border: n.type === 'diagnosis' ? '2px solid #16a34a' : '1px solid #ddd',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: 180
        }
    })) || [];

    const initialEdges = data?.edges?.map((e: any, i: number) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#94a3b8' },
        labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 }
    })) || [];

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
    );

    const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
    const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

    if (!data || !data.nodes || data.nodes.length === 0) {
        return <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">Aucun graphe de raisonnement disponible.</div>;
    }

    return (
        <div className="h-[500px] w-full border border-gray-200 rounded-xl bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#ccc" gap={20} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}