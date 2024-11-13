import React from 'react';
import { Palette } from 'lucide-react';

export const filters = [
  { id: 'none', name: 'Original' },
  { id: 'frame-based', name: 'Video Frames' },
  { id: 'vibrant', name: 'Vibrant' },
  { id: 'dynamic', name: 'Dynamic' },
  { id: 'contrast', name: 'High Contrast' },
  { id: 'neon', name: 'Neon' },
  { id: 'gradient-flow', name: 'Gradient Flow' },
] as const;

export type FilterType = typeof filters[number]['id'];

interface Props {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const ColorFilters: React.FC<Props> = ({ selectedFilter, onFilterChange }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Color Filter
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selectedFilter === filter.id
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } hover:scale-105 active:scale-95`}
            aria-pressed={selectedFilter === filter.id}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
};