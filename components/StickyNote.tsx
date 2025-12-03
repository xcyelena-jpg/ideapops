import React from 'react';
import { Note, NoteColor } from '../types';

interface StickyNoteProps {
  note: Note;
  className?: string;
  scale?: number;
  shadow?: boolean;
}

const colorMap: Record<NoteColor, string> = {
  yellow: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  pink: 'bg-pink-200 text-pink-900 border-pink-300',
  blue: 'bg-blue-200 text-blue-900 border-blue-300',
  green: 'bg-green-200 text-green-900 border-green-300',
  purple: 'bg-purple-200 text-purple-900 border-purple-300',
  orange: 'bg-orange-200 text-orange-900 border-orange-300',
};

export const StickyNote: React.FC<StickyNoteProps> = ({ note, className = '', scale = 1, shadow = true }) => {
  const colorClasses = colorMap[note.color];
  
  const getFontSizeClass = (content: string): string => {
    const length = content.length;
    if (length < 30) {
      return 'text-xl'; // Was 2xl
    }
    if (length < 80) {
      return 'text-lg'; // Was xl
    }
    if (length < 150) {
      return 'text-base'; // Was lg
    }
    return 'text-sm'; // Was base
  };

  const fontSizeClass = getFontSizeClass(note.content);

  return (
    <div 
      className={`relative p-6 w-72 h-72 flex flex-col justify-between ${colorClasses} ${shadow ? 'shadow-lg' : ''} ${className}`}
      style={{
        transform: `rotate(${note.rotation}deg) scale(${scale})`,
        borderRadius: '2px 2px 20px 2px', // Slight dog-ear effect
        boxShadow: shadow ? '5px 5px 15px rgba(0,0,0,0.1)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Tape effect (purely decorative) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 rotate-1 backdrop-blur-sm rounded-sm"></div>

      <div className={`font-cute font-bold ${fontSizeClass} leading-tight mt-4 overflow-y-auto no-scrollbar flex-grow flex items-center justify-center text-center`}>
        {note.content}
      </div>
      
      <div className="text-xs opacity-60 font-sans font-bold text-right mt-2 uppercase tracking-wider">
        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};