import { toast } from "sonner";
import { CellKeeper } from "../cell/cell-keeper";
import { CellState, CellType } from "../cell/cell.types";
import { Board } from "./board.types";

export class BoardKeeper {
  static readonly side: number = 25;
  static readonly minesCoef: number = 0.1;

  static incrementNeighbours(board: Board): Board {
    for (let row = 0; row < board.length; row++) {
      const rowLength = board[row].length;
      for (let col = 0; col < rowLength; col++) {
        this.incrementNeighboursForCell(board, row, col);
      }
    }

    return board;
  }


  static incrementNeighboursForCell(board: Board, row: number, col: number): void {
    const cell = board[row][col];
    const [type, _state] = CellKeeper.getCellInfo(cell);
    // console.log('increment neighbours for cell', row, col);

    // looking for mines to then find neighbours
    if (type === CellType.Mine) {
      const neighbours = this.getNeighbours(board, row, col);
      for (const [nRow, nCol] of neighbours) {
        board[nRow][nCol] = CellKeeper.incrementCell(board[nRow][nCol]);
      }
    }
  }

  static handleCellClick(board: Board, row: number, col: number): Board | void {
    const cell = board[row][col];
    const [type, state, modulo] = CellKeeper.getCellInfo(cell);

    if (state === CellState.Revealed) {
      return;
    }

    if (state === CellState.Flagged) {
      console.log('flagged cell click handler', row, col);
      return;
    }

    const newValue = CellKeeper.revealCell(cell);

    if (newValue === cell) {
      return;
    }

    board[row][col] = newValue;

    if (type === CellType.Mine) {
      toast.error('BOOM!');
      // reveal all mines? or the whole field?
      return board;
    }

    if (modulo === 0) {
      // reveal all neutral cells with 0 neighbours
      this.revealNeutralNeighbours(board, row, col);
      return board;
    }

    return board;
  }

  static handleCellRightClick(board: Board, row: number, col: number): Board | void {
    const cell = board[row][col];
    const [type, state] = CellKeeper.getCellInfo(cell);

    const newValue = CellKeeper.flagCell(cell, type, state);

    board[row][col] = newValue;

    return board;
  }

  static revealNeutralNeighbours(board: Board, row: number, col: number): Board | void {
    const neighbours = this.getNeighbours(board, row, col);
    for (const [nRow, nCol] of neighbours) {
      const [type, state, modulo] = CellKeeper.getCellInfo(board[nRow][nCol]);

      board[nRow][nCol] = CellKeeper.revealCell(board[nRow][nCol]);

      if (type !== CellType.Neutral) {
        continue;
      }

      if (state === CellState.Hidden && modulo === 0) {
        this.revealNeutralNeighbours(board, nRow, nCol);
      }
    }
  }

  /**
   * Get all neighbours for a cell excluding the current one
   */
  static getNeighbours(board: Board, row: number, col: number): number[][] {
    const neighbours: number[][] = [];

    // rows: previous -1, current 0, next 1
    for (let nRow = -1; nRow < 2; nRow++) {
      const nRowIndex = nRow + row;
      if (nRowIndex < 0 || nRowIndex >= board.length) {
        continue;
      }

      // columns: previous -1, current 0, next 1
      for (let nCol = -1; nCol < 2; nCol++) {
        if (nRow === 0 && nCol === 0) {
          // skip current cell
          continue;
        }

        const nColIndex = nCol + col;
        if (nColIndex < 0 || nColIndex >= board[nRowIndex].length) {
          continue;
        }

        if (typeof board[nRowIndex][nColIndex] !== 'number') {
          continue;
        }

        neighbours.push([nRowIndex, nColIndex]);
      }
    }

    return neighbours;
  }

  /**
   * Return next step to solve the board
   */
  static getNextStep(board: Board): [number, number][] {

    // const bombs: [number, number][] = [];
    const bombsSet = new Set<string>();
    const moves: [number, number][] = [];

    let tries = 0;

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        const [type, state, modulo] = CellKeeper.getCellInfo(cell);

        if (state === CellState.Hidden) {
          continue;
        }

        if (type !== CellType.Neutral) {
          // cannot be a case
          continue;
        }

        if (modulo === 0) {
          continue;
        }

        const neighbours = this.getNeighbours(board, row, col);

        let closedNeighbours: [number, number][] = [];
        let bombNeighbours: [number, number][] = [];
        for (const [nRow, nCol] of neighbours) {
          const [nType, nState, nModulo] = CellKeeper.getCellInfo(board[nRow][nCol]);

          if (bombsSet.has(`${nRow}-${nCol}`)) {
            bombNeighbours.push([nRow, nCol]);
          } else if (nState === CellState.Hidden) {
            closedNeighbours.push([nRow, nCol]);
          }
        }

        if (closedNeighbours.length === modulo - bombNeighbours.length) {
          // bombs.push(...closedNeighbours);
          for (const [nRow, nCol] of closedNeighbours) {
            bombsSet.add(`${nRow}-${nCol}`);
          }
        }

        if (bombNeighbours.length === modulo) {
          moves.push(...closedNeighbours);
        }
      }

      // if last iteration and moves are empty, go once more
      if (row === board.length - 1 && moves.length === 0 && tries === 0) {
        console.log('using second try');
        row = -1;
        tries++;
      }
    }



    /*
      Если modulo = closed neighbours; closed neighbours = bombs
      Если modulo - bombs = 0; open all other neighbours
    */

    return moves;
  }
}
