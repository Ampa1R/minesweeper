import { Board } from "../modules/board/board.types";
import { Cell } from "./Cell";

interface BoardFieldProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
}

export const BoardField: React.FC<BoardFieldProps> = ({ board, onCellClick, onCellRightClick }) => {
  const handleCellClick = (row: number, col: number) => {
    onCellClick(row, col);
  }

  const handleCellRightClick = (row: number, col: number) => {
    onCellRightClick(row, col);
  }

  return <div className="flex flex-col gap-1 w-[600px] m-auto">
    {board.map((row, i) => (
      <div key={i} className="flex gap-1">
        {row.map((cell, j) => (
          <Cell key={j} value={cell} onClick={() => handleCellClick(i, j)} onRightClick={() => handleCellRightClick(i, j)} />
        ))}
      </div>
    ))}
  </div>
}