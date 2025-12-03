import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Note } from '../types';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  notes: Note[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onDateChange, notes }) => {
  const [viewDate, setViewDate] = React.useState(new Date(currentDate));

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const getNotesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return notes.filter(n => n.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  
  const isSelected = (day: number) => {
     return day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
  }

  const grid = [];
  // Empty slots for start of month
  for (let i = 0; i < startDay; i++) {
    grid.push(<div key={`empty-${i}`} className="h-14"></div>);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayNotes = getNotesForDay(day);
    const hasNotes = dayNotes.length > 0;
    const selected = isSelected(day);

    grid.push(
      <button
        key={day}
        onClick={() => {
            const newDate = new Date(year, month, day);
            onDateChange(newDate);
        }}
        className={`relative h-14 w-full flex flex-col items-center justify-center rounded-2xl transition-all duration-200 font-cute
            ${selected ? 'bg-rose-500 text-white shadow-md transform scale-105 z-10' : 'hover:bg-white text-stone-600'}
            ${isToday(day) && !selected ? 'border-2 border-rose-200 text-rose-500' : ''}
        `}
      >
        <span className={`text-lg font-bold ${selected ? 'text-white' : ''}`}>{day}</span>
        
        {hasNotes && (
          <div className="flex -space-x-1 mt-1">
             {dayNotes.slice(0, 3).map((note, idx) => (
                 <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full border border-white ${
                        note.color === 'yellow' ? 'bg-yellow-400' :
                        note.color === 'pink' ? 'bg-pink-400' :
                        note.color === 'blue' ? 'bg-blue-400' :
                        note.color === 'green' ? 'bg-green-400' :
                        note.color === 'purple' ? 'bg-purple-400' : 'bg-orange-400'
                    }`}
                 />
             ))}
             {dayNotes.length > 3 && <div className="w-2 h-2 rounded-full bg-stone-300 border border-white" />}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full text-stone-500 transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="text-2xl font-bold text-rose-500 font-cute">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full text-stone-500 transition-colors">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider font-cute">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {grid}
      </div>
    </div>
  );
};