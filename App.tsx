import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Layout, X, Edit3, Trash2, Grid2X2, Layers } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Note, NoteColor } from './types';
import { DailyStack } from './components/DailyStack';
import { CalendarView } from './components/CalendarView';
import { StickyNote } from './components/StickyNote';

const COLORS: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

// Helper function to avoid timezone issues with toISOString()
const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Animation Variants for Grid View ("Scatter" and "Gather" effect)
const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1
    }
  }
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<'daily' | 'calendar'>('daily');
  const [isGridMode, setIsGridMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Action State
  const [actionNote, setActionNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // New Note State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<NoteColor>('yellow');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('ideaPops_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('ideaPops_notes', JSON.stringify(notes));
  }, [notes]);

  // Effect to handle returning to the app on a new day
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setCurrentDate(prevDate => {
          const today = new Date();
          const todayString = toISODateString(today);
          const prevDateString = toISODateString(prevDate);

          if (todayString !== prevDateString) {
            return today; // It's a new day, update to today
          }
          return prevDate; // It's the same day, keep the user's selected date
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setView('daily');
    setIsGridMode(false); // Reset to stack view on date change
  };

  const getNotesForDate = (date: Date) => {
    const dateStr = toISODateString(date);
    return notes.filter(n => n.date === dateStr).sort((a, b) => b.timestamp - a.timestamp); 
  };

  const getRandomColor = (excludeColor?: NoteColor): NoteColor => {
    const availableColors = excludeColor ? COLORS.filter(c => c !== excludeColor) : COLORS;
    if (availableColors.length === 0) {
      // Fallback in case all colors are somehow excluded (e.g., only one color in COLORS array)
      return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  const openNewNoteModal = () => {
    const currentDayNotes = getNotesForDate(currentDate);
    const lastNoteColor = currentDayNotes.length > 0 ? currentDayNotes[0].color : undefined;
    
    setNewNoteContent('');
    setNewNoteColor(getRandomColor(lastNoteColor));
    setEditingNoteId(null);
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;

    if (editingNoteId) {
        // Update existing note
        setNotes(prev => prev.map(n => 
            n.id === editingNoteId 
            ? { ...n, content: newNoteContent } // Keep original color and date
            : n
        ));
    } else {
        // Create new note
        const newNote: Note = {
            id: Date.now().toString(),
            content: newNoteContent,
            date: toISODateString(currentDate),
            timestamp: Date.now(),
            color: newNoteColor,
            rotation: Math.random() * 6 - 3, // Random rotation
        };
        setNotes(prev => [newNote, ...prev]);
    }

    setNewNoteContent('');
    setEditingNoteId(null);
    setIsModalOpen(false);
  };

  const handleLongPressNote = (note: Note) => {
      setActionNote(note);
      setIsDrawerOpen(true);
  };

  const handleEditAction = () => {
      if (actionNote) {
          setNewNoteContent(actionNote.content);
          setNewNoteColor(actionNote.color);
          setEditingNoteId(actionNote.id);
          setIsDrawerOpen(false);
          setIsModalOpen(true);
      }
  };

  const handleDeleteAction = () => {
      setIsDrawerOpen(false);
      setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
      if (actionNote) {
          setNotes(prev => prev.filter(n => n.id !== actionNote.id));
      }
      setIsDeleteConfirmOpen(false);
      setActionNote(null);
  };

  const currentNotes = getNotesForDate(currentDate);

  // Toggle between Grid and Stack
  const toggleGridMode = () => {
    setIsGridMode(prev => !prev);
  };

  // Switch between main views (Daily vs Calendar)
  const handleViewSwitch = (newView: 'daily' | 'calendar') => {
      setView(newView);
      if (newView === 'calendar') setIsGridMode(false);
  };
  
  const colorMap: Record<NoteColor, {bg: string, text: string}> = {
    yellow: { bg: 'bg-yellow-200', text: 'text-yellow-900'},
    pink: { bg: 'bg-pink-200', text: 'text-pink-900' },
    blue: { bg: 'bg-blue-200', text: 'text-blue-900' },
    green: { bg: 'bg-green-200', text: 'text-green-900' },
    purple: { bg: 'bg-purple-200', text: 'text-purple-900' },
    orange: { bg: 'bg-orange-200', text: 'text-orange-900' },
  };
  
  const getNoteInputFontSizeClass = (content: string): string => {
    const length = content.length;
    if (length < 30) {
      return 'text-xl';
    }
    if (length < 80) {
      return 'text-lg';
    }
    if (length < 150) {
      return 'text-base';
    }
    return 'text-sm';
  };

  return (
    <div className="min-h-screen bg-[#FDFBFF] text-stone-700 font-sans selection:bg-rose-200">
      
      {/* Background Gradient Blobs */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-20vh] left-[-20vw] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-rose-100/80 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-15vh] right-[-15vw] w-[50vw] h-[50vw] max-w-[450px] max-h-[450px] bg-purple-100/80 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-[25vh] left-[5vw] w-[30vw] h-[30vw] max-w-[200px] max-h-[200px] bg-blue-100/50 rounded-full filter blur-2xl opacity-30"></div>
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-5 flex justify-between items-center transition-all duration-300">
        <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm font-cute text-stone-800">
                IdeaPops
            </h1>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest font-cute mt-1">
                {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}
            </p>
        </div>
        
        <div className="flex gap-3 items-center">
            <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 flex">
                 <button 
                    onClick={() => handleViewSwitch('daily')}
                    className={`relative p-2 rounded-xl transition-all duration-300 ${view === 'daily' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    <Layout size={20} />
                    <AnimatePresence>
                        {view === 'daily' && currentNotes.length > 0 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white"
                            >
                                {currentNotes.length}
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </button>
                 <button 
                    onClick={() => handleViewSwitch('calendar')}
                    className={`p-2 rounded-xl transition-all duration-300 ${view === 'calendar' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-stone-400 hover:text-stone-600'}`}
                 >
                    <CalendarIcon size={20} />
                 </button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-28 h-screen max-h-screen flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
            {view === 'daily' ? (
                isGridMode ? (
                    /* GRID VIEW */
                    <motion.div
                        key="grid-view"
                        variants={gridContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full h-full overflow-y-auto no-scrollbar px-4 pb-48"
                    >
                        <div className="columns-2 gap-6 space-y-6 pt-2 px-2">
                            {currentNotes.map((note) => (
                                <motion.div 
                                    variants={gridItemVariants}
                                    key={note.id} 
                                    className="break-inside-avoid mb-6 flex justify-center" 
                                    onClick={() => handleLongPressNote(note)}
                                >
                                     <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center', marginBottom: '-100px' }}>
                                        <StickyNote 
                                            note={note} 
                                            shadow={true}
                                            className="cursor-pointer hover:rotate-0 transition-transform duration-300 hover:shadow-xl"
                                        />
                                     </div>
                                </motion.div>
                            ))}
                        </div>
                        {currentNotes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                                <p className="font-cute text-xl opacity-50">Empty Canvas...</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* STACK VIEW */
                    <motion.div
                        key="stack-view"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="w-full h-full"
                    >
                        <DailyStack 
                            key={toISODateString(currentDate)}
                            notes={currentNotes}
                            onLongPress={handleLongPressNote}
                        />
                    </motion.div>
                )
            ) : (
                /* CALENDAR VIEW */
                <motion.div 
                    key="calendar-view"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full h-full overflow-y-auto no-scrollbar pb-10"
                >
                    <CalendarView 
                        currentDate={currentDate} 
                        onDateChange={handleDateChange} 
                        notes={notes}
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </main>

      {/* Grid/Stack Toggle Button (Left) */}
      <div className="fixed bottom-10 left-6 z-40">
        <AnimatePresence>
        {view === 'daily' && currentNotes.length > 0 && (
            <motion.button
                onClick={toggleGridMode}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                className="bg-white/80 backdrop-blur-md w-14 h-14 rounded-2xl shadow-lg border border-white/50 text-stone-500 hover:text-rose-500 hover:bg-white transition-all active:scale-95 flex items-center justify-center"
            >
                <AnimatePresence mode="wait">
                    {isGridMode ? 
                        <motion.div key="layers" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                            <Layers size={24} />
                        </motion.div> : 
                        <motion.div key="grid" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }}>
                            <Grid2X2 size={24} />
                        </motion.div>
                    }
                </AnimatePresence>
            </motion.button>
        )}
        </AnimatePresence>
      </div>
            
      {/* Floating Action Button (Right) */}
      <div className="fixed bottom-10 right-6 z-40">
        {view === 'daily' && (
          <motion.button
              onClick={openNewNoteModal}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="bg-rose-500 text-white w-18 h-18 p-5 rounded-full shadow-2xl shadow-rose-500/40 flex items-center justify-center border-4 border-white/30"
          >
              <Plus size={36} strokeWidth={3} />
          </motion.button>
        )}
      </div>


      {/* Action Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-[2px]"
                    onClick={() => setIsDrawerOpen(false)}
                />
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 border-t border-white/50"
                >
                    <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-8" />
                    <div className="space-y-4 mb-4">
                        <button 
                            onClick={handleEditAction}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-700 font-bold text-lg transition-colors border border-stone-100 font-cute"
                        >
                            <div className="bg-white p-2.5 rounded-full shadow-sm text-stone-600"><Edit3 size={22} /></div>
                            Edit Note
                        </button>
                        <button 
                            onClick={handleDeleteAction}
                            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 font-bold text-lg transition-colors border border-red-100 font-cute"
                        >
                            <div className="bg-white p-2.5 rounded-full shadow-sm text-red-400"><Trash2 size={22} /></div>
                            Delete Note
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Alert */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" 
                onClick={() => setIsDeleteConfirmOpen(false)} 
            />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-xs shadow-2xl text-center border border-white/50"
            >
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2 font-cute">Discard Idea?</h3>
                <p className="text-stone-500 mb-8 leading-relaxed font-cute">Are you sure you want to let this idea go? It will be gone forever.</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className="flex-1 py-3.5 rounded-2xl font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors font-cute"
                    >
                        Keep It
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3.5 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors font-cute"
                    >
                        Discard
                    </button>
                </div>
            </motion.div>
        </div>
      )}

      {/* Add/Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-stone-900/20 backdrop-blur-md" 
                  onClick={() => setIsModalOpen(false)} 
              />
              
              <motion.div 
                  initial={{ y: 50, opacity: 0, scale: 0.95 }} 
                  animate={{ y: 0, opacity: 1, scale: 1 }} 
                  exit={{ y: 50, opacity: 0, scale: 0.95 }}
                  className={`relative w-80 h-96 shadow-2xl flex flex-col p-6 ${colorMap[newNoteColor].bg} ${colorMap[newNoteColor].text}`}
                  style={{ borderRadius: '2px 2px 20px 2px' }}
              >
                  {/* Decorative tape */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 rotate-1 backdrop-blur-sm rounded-sm"></div>
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                      <h3 className="font-bold text-xl font-cute">
                          {editingNoteId ? 'Polishing Idea...' : 'New Spark'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-black/10 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Content Input */}
                  <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Type your inspiration here..."
                      className={`w-full h-full bg-transparent ${getNoteInputFontSizeClass(newNoteContent)} font-bold placeholder:text-current placeholder:opacity-50 focus:outline-none resize-none font-cute leading-relaxed text-center flex-grow no-scrollbar`}
                      autoFocus
                  />
                  
                  {/* Footer Controls */}
                  <div className="mt-auto pt-4 flex-shrink-0">
                      <button 
                          onClick={handleSaveNote}
                          disabled={!newNoteContent.trim()}
                          className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all font-cute
                              ${newNoteContent.trim() 
                                  ? 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700' 
                                  : 'bg-black/10 text-current opacity-30 cursor-not-allowed'}
                          `}
                      >
                          {editingNoteId ? 'Update' : 'Stick to Wall'}
                      </button>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;