import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const NODE_COLORS = {
  'Book': '#4CAF50',    // Green
  'Series': '#F44336',  // Red
  'Author': '#2196F3',  // Blue
  'Genre': '#9C27B0',   // Purple
  'Tag': '#FF9800'      // Orange
};

const RELATIONSHIP_STYLES = {
  'PART_OF': {          // Series
    type: 'solid',
    color: '#FF69B4',
    width: 3,
    opacity: 0.8
  },
  'WRITTEN_BY': {       // Author
    type: 'dashed',
    color: '#666666',
    width: 2,
    dashSize: 3,
    gapSize: 1
  },
  'IN_GENRE': {         // Genre
    type: 'dotted',
    color: '#999999',
    width: 1,
    dashSize: 1,
    gapSize: 1
  },
  'HAS_TAG': {          // Tag
    type: 'wavy',
    color: '#CCCCCC',
    width: 1,
    amplitude: 4,
    frequency: 0.2
  }
};

// Helper functions for different line types
const createBezierLine = (start, end, height = 30) => {
  const midPoint = new THREE.Vector3(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2 + height,
    (start.z + end.z) / 2
  );
  return new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(start.x, start.y, start.z),
    midPoint,
    new THREE.Vector3(end.x, end.y, end.z)
  );
};

const createWavyLine = (start, end, style) => {
  const points = [];
  const segments = 50;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pos = new THREE.Vector3(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t + 
        Math.sin(t * Math.PI * 2 * style.frequency) * style.amplitude,
      start.z + (end.z - start.z) * t
    );
    points.push(pos);
  }
  
  return new THREE.CatmullRomCurve3(points);
};

const EnhancedBookGraph = ({ 
  graphData, 
  onNodeClick, 
  controls, 
  highlightedNode, 
  focusedNode, 
  cameraMode,
  expandMode,
  expandedNodes,
  bloomEnabled,
  dagMode,
  collapseFilter
}) => {
  const fgRef = useRef();
  const [graphInstance, setGraphInstance] = useState(null);
  const composerRef = useRef(null);

  // Memoize and sanitize the graph data
  const safeGraphData = useMemo(() => {
    if (!graphData?.nodes?.length || !graphData?.links?.length) {
      return { nodes: [], links: [] };
    }

    // Create a map of valid nodes for quick lookup
    const nodeMap = new Map(
      graphData.nodes
        .filter(node => node && node.id)
        .map(node => [node.id.toString(), {
          ...node,
          id: node.id.toString(),
          color: NODE_COLORS[node.type] || '#ffffff'
        }])
    );

    // Filter and sanitize nodes
    const nodes = Array.from(nodeMap.values());

    // Filter and sanitize links
    const links = graphData.links
      .filter(link => {
        const sourceId = (link.source?.id || link.source)?.toString();
        const targetId = (link.target?.id || link.target)?.toString();
        return sourceId && targetId && nodeMap.has(sourceId) && nodeMap.has(targetId);
      })
      .map(link => {
        const sourceId = (link.source?.id || link.source).toString();
        const targetId = (link.target?.id || link.target).toString();
        return {
          ...link,
          source: nodeMap.get(sourceId),
          target: nodeMap.get(targetId),
          color: RELATIONSHIP_STYLES[link.type]?.color || '#ffffff',
          width: RELATIONSHIP_STYLES[link.type]?.width || 1
        };
      });

    return { nodes, links };
  }, [graphData]);

  // ... [Keep your existing useEffect blocks for graph instance, physics, and bloom]

  // Custom link rendering function
  const linkThreeObjectExtend = useCallback((link) => {
    return RELATIONSHIP_STYLES[link.type]?.type !== 'solid';
  }, []);

  const linkThreeObject = useCallback((link) => {
    if (!link?.source?.x || !link?.source?.y || !link?.source?.z ||
        !link?.target?.x || !link?.target?.y || !link?.target?.z) {
      return null;
    }

    const style = RELATIONSHIP_STYLES[link.type];
    if (!style || style.type === 'solid') return null;

    const start = new THREE.Vector3(link.source.x, link.source.y, link.source.z);
    const end = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
    const material = new THREE.LineBasicMaterial({ 
      color: link.color || style.color || '#ffffff',
      opacity: style.opacity || 1,
      transparent: true
    });

    switch (style.type) {
      case 'dashed': {
        const geometry = new THREE.BufferGeometry();
        const points = [];
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
          if (i % 2 === 0) {
            const t = i / segments;
            const point = start.clone().lerp(end, t);
            points.push(point.x, point.y, point.z);
          }
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        return new THREE.Line(geometry, material);
      }
      case 'wavy': {
        const curve = createWavyLine(start, end, style);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
        return new THREE.Line(geometry, material);
      }
      default:
        return null;
    }
  }, []);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={safeGraphData}
      dagMode={dagMode ? 'td' : null}
      dagLevelDistance={50}
      nodeLabel={node => node ? `${node.type}: ${node.name || node.title}` : ''}
      nodeColor={node => {
        if (!node?.id) return '#ffffff';
        const nodeId = node.id.toString();
        if (expandMode && expandedNodes?.has(nodeId)) {
          return '#32CD32';
        }
        if (nodeId === highlightedNode?.toString()) {
          return '#FFFF00';
        }
        if (nodeId === focusedNode?.toString()) {
          return '#FFA500';
        }
        return node.color;
      }}
      nodeRelSize={controls.nodeSize}
      linkWidth={link => {
        const sourceId = (link.source?.id || link.source)?.toString();
        const targetId = (link.target?.id || link.target)?.toString();
        const isConnectedToFocused = focusedNode && 
          (sourceId === focusedNode.toString() || targetId === focusedNode.toString());
        return isConnectedToFocused ? 3 : link.width || 1;
      }}
      linkColor={link => {
        const sourceId = (link.source?.id || link.source)?.toString();
        const targetId = (link.target?.id || link.target)?.toString();
        if (focusedNode && 
            (sourceId === focusedNode.toString() || targetId === focusedNode.toString())) {
          return '#FFFF00';
        }
        if (highlightedNode && 
            (sourceId === highlightedNode.toString() || targetId === highlightedNode.toString())) {
          return '#FFA500';
        }
        return link.color;
      }}
      linkOpacity={0.5}
      linkThreeObject={linkThreeObject}
      linkThreeObjectExtend={linkThreeObjectExtend}
      backgroundColor="#000000"
      onNodeClick={onNodeClick}
      enableNodeDrag={!cameraMode}
      enableNavigationControls={true}
      showNavInfo={true}
      warmupTicks={50}
      cooldownTicks={Infinity}
      d3Force={(d3Force) => {
        d3Force.force('charge').strength(controls.chargeStrength);
        d3Force.force('link').distance(controls.linkDistance);
        d3Force.force('center').strength(controls.centerStrength);
      }}
    />
  );
};

EnhancedBookGraph.defaultProps = {
  controls: {
    linkDistance: 100,
    chargeStrength: -200,
    centerStrength: 0.5,
    velocityDecay: 0.3,
    nodeSize: 6
  }
};

export default EnhancedBookGraph;