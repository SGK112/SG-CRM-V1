import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fab
} from '@mui/material';
import { BugReport, Close, Save, Notes } from '@mui/icons-material';

const DraggableBug = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const bugRef = useRef(null);

  const handleMouseDown = (e) => {
    if (bugRef.current) {
      const rect = bugRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep bug within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Open notes dialog when bug is dropped
      setShowNotes(true);
    }
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      const newNote = {
        id: Date.now(),
        text: noteText,
        position: { ...position },
        timestamp: new Date().toLocaleString()
      };
      setSavedNotes(prev => [...prev, newNote]);
      setNoteText('');
    }
    setShowNotes(false);
  };

  const handleCloseNotes = () => {
    setShowNotes(false);
    setNoteText('');
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Draggable Bug */}
      <Fab
        ref={bugRef}
        onMouseDown={handleMouseDown}
        sx={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#ff6b6b',
          color: 'white',
          '&:hover': {
            backgroundColor: '#ff5252',
            transform: 'scale(1.1)',
          },
          transition: isDragging ? 'none' : 'all 0.2s ease',
          userSelect: 'none',
        }}
        size="medium"
      >
        <BugReport />
      </Fab>

      {/* Notes Dialog */}
      <Dialog 
        open={showNotes} 
        onClose={handleCloseNotes}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'white'
        }}>
          <Notes />
          Bug Report Notes
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={handleCloseNotes} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Describe the bug or add your notes here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
              },
            }}
          />
          
          {savedNotes.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Previous Notes:
              </Typography>
              {savedNotes.slice(-3).map((note) => (
                <Paper 
                  key={note.id} 
                  sx={{ 
                    p: 2, 
                    mt: 1, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                >
                  <Typography variant="caption" display="block">
                    {note.timestamp}
                  </Typography>
                  <Typography variant="body2">
                    {note.text}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseNotes} 
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveNote}
            variant="contained"
            startIcon={<Save />}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Notes Indicator */}
      {savedNotes.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9998,
          }}
        >
          <Fab
            size="small"
            sx={{
              backgroundColor: '#4caf50',
              color: 'white',
              '&:hover': {
                backgroundColor: '#45a049',
              },
            }}
            onClick={() => setShowNotes(true)}
          >
            <Typography variant="caption">
              {savedNotes.length}
            </Typography>
          </Fab>
        </Box>
      )}
    </>
  );
};

export default DraggableBug;
