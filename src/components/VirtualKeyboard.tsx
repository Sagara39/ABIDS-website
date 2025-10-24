'use client';

import { Button } from '@/components/ui/button';
import { Delete, Eraser } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  isNumeric?: boolean;
}

const VirtualKeyboard = ({ onKeyPress, onBackspace, onClear, isNumeric = false }: VirtualKeyboardProps) => {
  const alphaKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const numericKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0'],
  ];
  
  const handleKeyClick = (key: string) => {
    onKeyPress(key);
  };
  
  const renderKeys = (keys: string[][]) => {
     return keys.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center gap-1.5">
        {row.map(key => (
          <Button
            key={key}
            onClick={() => handleKeyClick(key)}
            className="h-12 w-12 text-lg font-semibold"
            variant="outline"
          >
            {key}
          </Button>
        ))}
      </div>
    ));
  }

  return (
    <div className="flex flex-col items-center space-y-1.5 p-2 bg-background/50 rounded-lg">
      <div className="flex flex-row items-center space-x-1.5 w-full">
        <div className="flex-grow space-y-1.5">
          {isNumeric ? renderKeys(numericKeys) : renderKeys(alphaKeys)}
          {!isNumeric && (
             <div className="flex justify-center gap-1.5">
                <Button onClick={() => handleKeyClick(' ')} className="h-12 flex-grow text-lg" variant="outline">Space</Button>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-1.5">
            <Button
              onClick={onBackspace}
              className="h-full w-20 text-lg"
              variant="destructive"
              aria-label="Backspace"
            >
              <Delete className="w-6 h-6" />
            </Button>
             <Button
              onClick={onClear}
              className="h-12 w-20 text-lg"
              variant="secondary"
              aria-label="Clear"
            >
              <Eraser className="w-6 h-6" />
            </Button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
