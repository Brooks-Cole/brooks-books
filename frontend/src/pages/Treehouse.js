// frontend/src/pages/Treehouse.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  IconButton, 
  Typography, 
  Paper,
  Badge,
  Avatar,
  Divider
} from '@mui/material';
import { Send, Image } from '@mui/icons-material';
import GifPicker from '../components/GifPicker.js';
import websocketService from '../services/webSocketService.js';

function Treehouse() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const handleMessage = (data) => {
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'onlineCount') {
        setOnlineCount(data.count);
      }
    };

    websocketService.addMessageHandler(handleMessage);
    websocketService.connect();

    // Cleanup on component unmount
    return () => {
      websocketService.removeMessageHandler(handleMessage);
      websocketService.disconnect();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() && !mediaUrl) return;
  
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    const messageData = {
      content: message,
      author: {
        username: user.username || 'Guest',
        id: user.userId || user.id
      },
      timestamp: new Date().toISOString(),
      mediaUrl,
      mediaType
    };
  
    try {
      websocketService.sendMessage(messageData);
      setMessage('');
      setMediaUrl('');
      setMediaType(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleGifSelect = (gif) => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    const gifUrl = gif.media_formats?.gif?.url || gif.url;
  
    const messageData = {
      content: '',
      author: {
        username: user.username || 'Guest',
        id: user.userId || user.id
      },
      timestamp: new Date().toISOString(),
      mediaUrl: gifUrl,
      mediaType: 'gif'
    };
  
    try {
      websocketService.sendMessage(messageData);
      setGifPickerOpen(false);
    } catch (error) {
      console.error('Error sending GIF message:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: 'background.default' 
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">Treehouse Chat</Typography>
          <Badge 
            badgeContent={onlineCount} 
            color="success"
            sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem' } }}
          >
            <Typography variant="body2">Online</Typography>
          </Badge>
        </Box>

        {/* Messages */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {messages.map((msg, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignSelf: msg.author?.id === JSON.parse(localStorage.getItem('user'))?.id ? 'flex-end' : 'flex-start',
                maxWidth: '70%'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 0.5,
                gap: 1
              }}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24,
                    bgcolor: msg.author?.id === JSON.parse(localStorage.getItem('user'))?.id ? 'primary.main' : 'secondary.main'
                  }}
                >
                  {msg.author?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {msg.author?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>

              <Paper 
                sx={{ 
                  p: 1.5,
                  bgcolor: msg.author?.id === JSON.parse(localStorage.getItem('user'))?.id ? 'primary.light' : 'background.paper',
                  maxWidth: '100%'
                }}
              >
                {msg.content && (
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {msg.content}
                  </Typography>
                )}
                {msg.mediaUrl && (
                  <Box 
                    component="img"
                    src={msg.mediaUrl}
                    alt="Chat media"
                    sx={{ 
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: 1,
                      mt: msg.content ? 1 : 0
                    }}
                  />
                )}
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box 
          component="form" 
          onSubmit={handleSend}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            gap: 1
          }}
        >
          <IconButton 
            onClick={() => setGifPickerOpen(true)}
            sx={{ alignSelf: 'center' }}
          >
            <Image />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <IconButton 
            type="submit"
            color="primary"
            disabled={!message.trim() && !mediaUrl}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>

      <GifPicker 
        open={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={handleGifSelect}
      />
    </Container>
  );
}

export default Treehouse;