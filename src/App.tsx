import { useEffect, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button';
import { BoardKeeper } from './modules/board/board-keeper';
import { Slider } from './components/ui/slider';
import { Badge } from './components/ui/badge';
import { BoardField } from './components/BoardField';

/*
  cell state
  Hidden / Revealed / Flagged



  10 - 18 - number of bombs around + Hidden
  19 - Mine + Hidden
  20 - 28 - number of bombs around + Revealed
  29 - Mine + Revealed
  30 - 38 - number of bombs around + Flagged
  39 - Mine + Flagged
*/


function App() {
  const [side, setSide] = useState(20);
  const [coef, setCoef] = useState(0.1);
  const [fields, setFields] = useState<number[][]>([]);

  useEffect(() => {
    generateField();
  }, []);

  const generateEmptyFields = () => {
    return Array.from(
      { length: side },
      () => Array.from({ length: side }, () => 10),
    );
  }

  const generateField = () => {
    const newFields = generateEmptyFields();

    const totalCells = side * side;
    const totalBombs = Math.floor(totalCells * coef);

    const getRandomCell = () => {
      const randomCell = Math.floor(Math.random() * totalCells);
      const row = Math.floor(randomCell / side);
      const col = randomCell % side;
      return { row, col };
    }

    // randomly infuse array of cells with bombs
    for (let i = 0; i < totalBombs; i++) {
      const { row, col } = getRandomCell();
      if (newFields[row][col] === 19) {
        i--;
        continue;
      }
      newFields[row][col] = 19;
    }

    BoardKeeper.incrementNeighbours(newFields);

    setFields(newFields);
  }


  const handleCellClick = (row: number, col: number) => {
    console.log('handleCellClick', row, col);

    const newFields = fields.map((row) => row.map((cell) => cell));

    const updatedBoard = BoardKeeper.handleCellClick(newFields, row, col);

    if (updatedBoard) {
      setFields(updatedBoard);
    }
  }

  const handleCellRightClick = (row: number, col: number) => {
    console.log('handleCellRightClick', row, col);

    const newFields = fields.map((row) => row.map((cell) => cell));

    const updatedBoard = BoardKeeper.handleCellRightClick(newFields, row, col);

    if (updatedBoard) {
      setFields(updatedBoard);
    }
  }

  const [moves, setMoves] = useState<[number, number][]>([]);

  const handleNextStep = () => {
    const nextStep = BoardKeeper.getNextStep(fields);
    console.log('nextStep', nextStep);
    // unique moves
    const m = nextStep.filter((move, index, self) =>
      index === self.findIndex((t) => t[0] === move[0] && t[1] === move[1])
    );
    setMoves(m);
  };

  const handleMoveClick = (row: number, col: number) => {
    handleCellClick(row, col);
  }

  return (
    <>
      <div className="fixed left-4 top-4 flex flex-col gap-2">
        <div>Mines: {Math.floor(side * side * coef)}</div>
        <div>Field size: {side}x{side}</div>
        <div>Total cells: {side * side}</div>
        <hr />
        <Button onClick={handleNextStep}>
          Next step
        </Button>
        <div>
          {moves.map((move) => <div key={move.join('-')} onClick={() => handleMoveClick(move[0], move[1])}>{move.join('-')}</div>)}
        </div>
      </div>
      <BoardField board={fields} onCellClick={handleCellClick} onCellRightClick={handleCellRightClick} />
      <div className="flex gap-4 mt-10">
        <Button className="m-auto" variant="destructive" onClick={() => generateField()}>
          Restart
        </Button>
        <Slider className="w-[30%]" value={[side]} onValueChange={([value]) => setSide(value)} min={3} max={100} />
        <Badge>{side}</Badge>
        <Slider className="w-[30%]" value={[coef]} onValueChange={([value]) => setCoef(value)} min={0.01} max={0.5} step={0.01} />
        <Badge>{coef}</Badge>
      </div>

    </>
  )
}

export default App
