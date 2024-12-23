
import { twMerge } from "tailwind-merge";
import { CellKeeper } from "../modules/cell/cell-keeper";
import { CellState, CellType } from "../modules/cell/cell.types";

function getColor(type: CellType, state: CellState) {
  if (type === CellType.Mine) {
    if (state === CellState.Hidden) {
      // return 'bg-red-200';
      return 'bg-slate-300';
    }
    if (state === CellState.Revealed) {
      return 'bg-red-700';
    }
    return 'bg-red-300';
  }

  if (state === CellState.Hidden) {
    return 'bg-slate-300';
  }
  if (state === CellState.Revealed) {
    return 'bg-blue-100';
  }
  return 'bg-blue-300';
}

function getDisplayValue(type: CellType, state: CellState, modulo: number): string {
  if (state === CellState.Hidden) {
    return '';
  }

  if (state === CellState.Flagged) {
    return '🚩';
  }

  if (type === CellType.Mine) {
    return '💣';
  }

  if (type === CellType.Neutral) {
    if (modulo === 0) {
      return '';
    }
    return modulo.toString();
  }

  return state.toString();
}

interface CellProps {
  value: number;
  onClick: () => void;
  onRightClick: () => void;
}

export const Cell: React.FC<CellProps> = ({ value, onClick, onRightClick }) => {
  const [type, state, modulo] = CellKeeper.getCellInfo(value);
  const color = getColor(type, state);
  const displayValue = getDisplayValue(type, state, modulo);

  const handleClick = () => {
    if (state === CellState.Flagged) {
      console.log('im flagged');
      return;
    }
    onClick();
  }
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick();
  };

  return <div
    className={twMerge(`aspect-square bg-muted rounded-sm h-6 hover:cursor-pointer`, color)}
    onClick={handleClick}
    onContextMenu={handleRightClick}
  >
    {displayValue}
  </div>;
}

