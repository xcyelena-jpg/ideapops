import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Note } from '../types';
import { StickyNote } from './StickyNote';
import { Sparkles } from 'lucide-react';

interface DailyStackProps {
  notes: Note[];
  onLongPress: (note: Note) => void;
}

export const DailyStack: React.FC<DailyStackProps> = ({ notes, onLongPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400 mb-28">
        <div className="bg-white p-8 rounded-full mb-4 shadow-sm">
          <Sparkles size={48} className="text-rose-200" />
        </div>
        <p className="text-xl font-bold mb-6 font-cute text-stone-300">No inspirations yet today.</p>
      </div>
    );
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      setDirection(info.offset.x > 0 ? 1 : -1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Circular Index Logic
  const activeIndex = currentIndex % notes.length;
  // Handle case where nextIndex might wrap correctly even if current index is large
  const nextIndex = (currentIndex + 1) % notes.length;
  
  const activeNote = notes[activeIndex];
  const nextNote = notes[nextIndex];

  // Long Press Handlers
  const handlePointerDown = () => {
    longPressTimerRef.current = setTimeout(() => {
        onLongPress(activeNote);
    }, 500); // 500ms threshold for long press
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative w-80 h-96 flex items-center justify-center mb-28">
        
        {/* Background Card (Next in loop) */}
        {notes.length > 1 && (
            <motion.div
                key={`bg-${nextNote.id}`}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                style={{ zIndex: 10 }}
            >
                {/* Visual state matches the 'initial' state of the entering active card */}
                <div style={{ transform: `scale(0.95) rotate(${nextNote.rotation - 5}deg)`, transition: 'transform 0.3s' }}>
                     <StickyNote note={nextNote} shadow={false} className="opacity-60" />
                </div>
            </motion.div>
        )}

        {/* Foreground Card (Active) */}
        <AnimatePresence mode='popLayout'>
            <motion.div
                key={activeNote.id}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ zIndex: 50 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onDragStart={cancelLongPress} // Cancel long press if user starts swiping
                onPointerDown={handlePointerDown}
                onPointerUp={cancelLongPress}
                onPointerLeave={cancelLongPress}
                
                // Start slightly smaller/rotated to match the background card position
                initial={{ scale: 0.95, opacity: 1, x: 0, rotate: activeNote.rotation - 5 }} 
                animate={{ scale: 1, opacity: 1, x: 0, rotate: activeNote.rotation }}
                
                // Exit animation flies off screen
                exit={{ 
                  x: direction * 500, 
                  opacity: 0, 
                  rotate: activeNote.rotation + (direction * 45),
                  transition: { duration: 0.3, ease: "easeIn" } 
                }}
                
                whileDrag={{ scale: 1.05, rotate: 0 }}
                whileTap={{ scale: 1.05, cursor: "grabbing" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <StickyNote note={activeNote} />
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};