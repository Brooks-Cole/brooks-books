import React, { useState } from 'react';
import { 
  Box,
  Chip,
  Typography,
  Collapse,
  IconButton,
  Paper,
  Switch,
  Tooltip,
  Divider
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  ExpandLess,
  Clear
} from '@mui/icons-material';


const NODE_TYPES = {
  Book: { color: '#4287f5', label: 'Books' },
  Series: { color: '#42f554', label: 'Series' },
  Author: { color: '#f5d742', label: 'Authors' },
  Genre: { color: '#f54242', label: 'Genres' },
  Tag: { color: '#9d42f5', label: 'Tags' }
};

const RELATIONSHIP_TYPES = {
  PART_OF: { color: '#FF69B4', label: 'Series Connections' },
  WRITTEN_BY: { color: '#666666', label: 'Author Connections' },
  IN_GENRE: { color: '#999999', label: 'Genre Connections' },
  HAS_TAG: { color: '#CCCCCC', label: 'Tag Connections' }
};

const FilterControls = ({ 
  activeFilters,
  onFilterChange,
  onResetFilters
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showRelationships, setShowRelationships] = useState(true);

  const handleNodeTypeToggle = (type) => {
    const newNodes = activeFilters.nodes.includes(type)
      ? activeFilters.nodes.filter(t => t !== type)
      : [...activeFilters.nodes, type];
    onFilterChange({ ...activeFilters, nodes: newNodes });
  };

  const handleRelationshipToggle = (type) => {
    const newRelationships = activeFilters.relationships.includes(type)
      ? activeFilters.relationships.filter(t => t !== type)
      : [...activeFilters.relationships, type];
    onFilterChange({ ...activeFilters, relationships: newRelationships });
  };

  const handleCategoryToggle = (isNode, enabled) => {
    if (isNode) {
      setShowNodes(enabled);
      if (!enabled) {
        onFilterChange({ ...activeFilters, nodes: [] });
      }
    } else {
      setShowRelationships(enabled);
      if (!enabled) {
        onFilterChange({ ...activeFilters, relationships: [] });
      }
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        width: 320,
        overflow: 'hidden',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(66, 66, 66, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography variant="subtitle1">Filters</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(activeFilters.nodes.length > 0 || activeFilters.relationships.length > 0) && (
            <Tooltip title="Reset all filters">
              <IconButton size="small" onClick={onResetFilters}>
                <Clear />
              </IconButton>
            </Tooltip>
          )}
          <IconButton 
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Node Types */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1 
            }}>
              <Typography variant="subtitle2">Node Types</Typography>
              <Switch
                size="small"
                checked={showNodes}
                onChange={(e) => handleCategoryToggle(true, e.target.checked)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(NODE_TYPES).map(([type, config]) => (
                <Chip
                  key={type}
                  label={config.label}
                  size="small"
                  disabled={!showNodes}
                  onClick={() => handleNodeTypeToggle(type)}
                  color={activeFilters.nodes.includes(type) ? 'primary' : 'default'}
                  sx={{
                    bgcolor: activeFilters.nodes.includes(type) ? config.color : undefined,
                    opacity: showNodes ? 1 : 0.5,
                    '&:hover': {
                      bgcolor: activeFilters.nodes.includes(type) 
                        ? config.color 
                        : 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Relationship Types */}
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1 
            }}>
              <Typography variant="subtitle2">Relationship Types</Typography>
              <Switch
                size="small"
                checked={showRelationships}
                onChange={(e) => handleCategoryToggle(false, e.target.checked)}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(RELATIONSHIP_TYPES).map(([type, config]) => (
                <Chip
                  key={type}
                  label={config.label}
                  size="small"
                  disabled={!showRelationships}
                  onClick={() => handleRelationshipToggle(type)}
                  color={activeFilters.relationships.includes(type) ? 'primary' : 'default'}
                  sx={{
                    bgcolor: activeFilters.relationships.includes(type) ? config.color : undefined,
                    opacity: showRelationships ? 1 : 0.5,
                    '&:hover': {
                      bgcolor: activeFilters.relationships.includes(type) 
                        ? config.color 
                        : 'rgba(0, 0, 0, 0.08)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Active Filters Summary */}
          {(activeFilters.nodes.length > 0 || activeFilters.relationships.length > 0) && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Active Filters: {activeFilters.nodes.length + activeFilters.relationships.length}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterControls;