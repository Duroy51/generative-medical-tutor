"use client";

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

export function KnowledgeGraph({ caseData }: { caseData: any }) {

    // Transformation des données du cas en Noeuds et Arêtes pour le graphe
    const { nodes, edges } = useMemo(() => {
        const initialNodes = [];
        const initialEdges = [];
        let yPos = 100;

        // 1. Noeud Central : Le Patient
        initialNodes.push({
            id: 'patient',
            type: 'input', // Noeud source
            data: { label: `Patient (${caseData.age} ans, ${caseData.sexe})` },
            position: { x: 250, y: 0 },
            style: { background: '#111827', color: 'white', fontWeight: 'bold' }
        });

        // 2. Noeuds Symptômes
        caseData.symptoms.forEach((sym: any, index: number) => {
            const id = `sym-${index}`;
            initialNodes.push({
                id: id,
                data: { label: `Symptôme: ${sym.nom}` },
                position: { x: 50 + (index * 150), y: 150 },
                style: { background: '#FFF7ED', border: '1px solid #F97316' }
            });
            // Lien Patient -> Symptôme
            initialEdges.push({ id: `e-p-${id}`, source: 'patient', target: id, animated: true });
        });

        // 3. Noeuds Diagnostics
        caseData.diagnoses.forEach((diag: any, index: number) => {
            const id = `diag-${index}`;
            initialNodes.push({
                id: id,
                data: { label: diag.is_final ? `Diagnostic FINAL: ${diag.description}` : `Différentiel: ${diag.description}` },
                position: { x: 100 + (index * 200), y: 300 },
                style: diag.is_final
                    ? { background: '#10B981', color: 'white' }
                    : { background: '#F3F4F6' }
            });

            // On relie arbitrairement les symptômes aux diagnostics pour la visualisation
            // (Dans un vrai réseau sémantique, on lierait précisément, ici on visualise la structure)
            caseData.symptoms.forEach((_, sIdx: number) => {
                initialEdges.push({
                    id: `e-s${sIdx}-d${index}`,
                    source: `sym-${sIdx}`,
                    target: id,
                    style: { stroke: '#ddd' }
                });
            });
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [caseData]);

    const [nodesState, , onNodesChange] = useNodesState(nodes);
    const [edgesState, , onEdgesChange] = useEdgesState(edges);

    return (
        <div style={{ height: 500 }} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}