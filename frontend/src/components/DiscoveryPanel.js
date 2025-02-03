import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { MenuBook, Group, Star, TrendingUp } from '@mui/icons-material';

const DiscoveryPanel = ({ selectedNode, graphData, onPathHighlight }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [similarityPaths, setSimilarityPaths] = useState([]);

  useEffect(() => {
    if (selectedNode?.type === 'Book') {
      findSimilarBooks(selectedNode, graphData);
    }
  }, [selectedNode, graphData]);

  const findSimilarBooks = (book, graph) => {
    const paths = [];
    const seen = new Set();
    const queue = [{
      node: book,
      path: [book],
      relationships: []
    }];

    while (queue.length > 0) {
      const { node, path, relationships } = queue.shift();
      
      // Find connected nodes
      graph.links
        .filter(link => link.source.id === node.id || link.target.id === node.id)
        .forEach(link => {
          const nextNode = link.source.id === node.id ? link.target : link.source;
          
          if (!seen.has(nextNode.id)) {
            seen.add(nextNode.id);
            const newPath = [...path, nextNode];
            const newRels = [...relationships, link.type];

            if (nextNode.type === 'Book' && nextNode.id !== book.id) {
              paths.push({ path: newPath, relationships: newRels });
            } else if (path.length < 4) { // Limit path length
              queue.push({
                node: nextNode,
                path: newPath,
                relationships: newRels
              });
            }
          }
        });
    }

    // Score and sort paths
    const scoredPaths = paths.map(p => ({
      ...p,
      score: calculateSimilarityScore(p)
    })).sort((a, b) => b.score - a.score);

    setSimilarityPaths(scoredPaths.slice(0, 5));
  };

  const calculateSimilarityScore = (pathData) => {
    const weights = {
      PART_OF: 5,    // Same series
      WRITTEN_BY: 4, // Same author
      IN_GENRE: 3,   // Same genre
      HAS_TAG: 2     // Shared tag
    };

    return pathData.relationships.reduce((score, rel) => score + (weights[rel] || 1), 0);
  };

  const renderSimilarityPath = (pathData) => {
    return (
      <Box 
        key={pathData.path.map(n => n.id).join('-')} 
        sx={{ 
          p: 2, 
          '&:hover': { bgcolor: 'action.hover' },
          borderRadius: 1,
          cursor: 'pointer'
        }}
        onClick={() => onPathHighlight(pathData.path)}
      >
        <Typography sx={{ fontWeight: 500 }}>
          {pathData.path[pathData.path.length - 1].title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {pathData.relationships.map((rel, idx) => (
            <Chip 
              key={idx} 
              label={rel.replace(/_/g, ' ')} 
              size="small"
              variant="outlined" 
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <MenuBook sx={{ width: 20, height: 20 }} />
          <Typography variant="h6">Similar Books</Typography>
        </Box>
        
        {similarityPaths.length > 0 ? (
          <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
            {similarityPaths.map(renderSimilarityPath)}
          </Box>
        ) : (
          <Typography color="text.secondary">
            Select a book to see similar titles
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscoveryPanel;