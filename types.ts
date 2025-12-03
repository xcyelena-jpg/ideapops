export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export interface Note {
  id: string;
  content: string;
  date: string; // ISO Date string YYYY-MM-DD
  timestamp: number;
  color: NoteColor;
  rotation: number; // For that random sticky note look
}

export interface DayData {
  date: string;
  notes: Note[];
}
