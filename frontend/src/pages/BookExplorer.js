import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, FormControlLabel, Switch, Select, MenuItem, Chip, Card, Typography, Slider, IconButton } from '@mui/material';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import config from '../config/config.js';
import { useAuth } from '../context/AuthContext.js';

const NODE_COLORS = {
  'Book': {
    default: '#4CAF50',
    selected: '#8BC34A',
    related: '#FFC107'
  },
  'Series': {
    default: '#F44336',
    selected: '#FF5252',
    related: '#FF8A80'
  },
  'Author': {
    default: '#2196F3',
    selected: '#64B5F6',
    related: '#90CAF9'
  },
  'Genre': {
    default: '#9C27B0',
    selected: '#BA68C8',
    related: '#CE93D8'
  },
  'Tag': {
    default: '#FF9800',
    selected: '#FFB74D',
    related: '#FFE0B2'
  }
};

const RELATIONSHIP_STRENGTHS = {
  'PART_OF': 3,
  'WRITTEN_BY': 2,
  'IN_GENRE': 1,
  'HAS_TAG': 1
};

const BookExplorer = () => {
  const { token } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    ageRange: [0, 18],
    relationshipTypes: ['PART_OF', 'WRITTEN_BY', 'IN_GENRE', 'HAS_TAG']
  });
  const fgRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiUrl}/recommendations/graph`, { // Updated path
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        // Enhance links with relationship strengths
        const enhancedLinks = data.links.map(link => ({
          ...link,
          value: RELATIONSHIP_STRENGTHS[link.type] || 1,
          color: getRelationshipColor(link.type)
        }));

        setGraphData({
          nodes: data.nodes.map(node => ({
            ...node,
            // Add force simulation parameters
            fx: null,
            fy: null,
            fz: null,
            size: node.type === 'Book' ? 8 : 6
          })),
          links: enhancedLinks
        });
        const links = data?.links?.map(link => ({ ...link, value: RELATIONSHIP_STRENGTHS[link.type] || 1, color: getRelationshipColor(link.type) })) || [];
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };
    fetchGraphData();
  }, []);

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNode(node);
    if (node.type === 'Book') {
      try {
        const bookId = node.id.replace(/['"]/g, '');
        console.log('Making request with bookId:', bookId);
        
        const response = await fetch(`${config.apiUrl}/recommendations/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          console.error('Response status:', response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received recommendations:', data);
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  }, [token]);

  const getRelationshipColor = (type) => {
    const colors = {
      'PART_OF': '#FF69B4',
      'WRITTEN_BY': '#666666',
      'IN_GENRE': '#999999',
      'HAS_TAG': '#CCCCCC'
    };
    return colors[type] || '#EEEEEE';
  };

  const RecommendationPanel = () => (
    <Card className="absolute right-4 top-4 w-80 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-lg">
      <Typography variant="h6" className="mb-4">
        {selectedNode ? `Similar to: ${selectedNode.title || selectedNode.name}` : 'Select a book to see recommendations'}
      </Typography>
      
      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className="p-3 rounded-lg bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={() => handleNodeClick(rec)}
            >
              <Typography variant="subtitle1">{rec.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                Similarity: {rec.similarityScore?.toFixed(2)}
              </Typography>
              <div className="flex gap-1 mt-1">
                {rec.matchFactors?.map((factor, i) => (
                  <Chip key={i} label={factor} size="small" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={node => node.title || node.name}
        nodeColor={node => {
          if (node.id === selectedNode?.id) return NODE_COLORS[node.type].selected;
          if (recommendations.some(rec => rec.id === node.id)) return NODE_COLORS[node.type].related;
          return NODE_COLORS[node.type].default;
        }}
        nodeRelSize={8}
        linkWidth={link => link.value}
        linkColor={link => link.color}
        onNodeClick={handleNodeClick}
        onNodeDragEnd={node => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={true}
        nodeThreeObject={node => {
          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ color: NODE_COLORS[node.type].default })
          );
          sprite.scale.set(16, 16, 1);
          return sprite;
        }}
        cooldownTicks={100}
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.02}
        d3AlphaMin={0.05}
        warmupTicks={100}
        onEngineStop={() => {
          // Stabilize nodes after initial layout
          graphData.nodes.forEach(node => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
          });
        }}
      />
      <RecommendationPanel />
    </Box>
  );
};

export default BookExplorer;