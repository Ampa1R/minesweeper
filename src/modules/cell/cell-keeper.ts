import { CellState, CellType } from "./cell.types";

export class CellKeeper {
  static getCellInfo(value: number): [CellType, CellState, number] {
    const valueModulo = value % 10;
    const type: CellType = valueModulo === 9 ? CellType.Mine : CellType.Neutral;
    const state: CellState = value - valueModulo;

    return [type, state, valueModulo];
  }

  static incrementCell(cell: number): number {
    const [type, _state] = CellKeeper.getCellInfo(cell);

    if (type === CellType.Mine) {
      return cell;
    }

    return cell + 1;
  }

  static revealCell(value: number): number {
    const [_, state] = CellKeeper.getCellInfo(value);

    if (state !== CellState.Hidden) {
      return value;
    }

    // going from hidden to revealed is always adding 10

    return value + 10;
  }

  static flagCell(value: number, _type: CellType, state: CellState): number {
    if (state === CellState.Revealed) {
      return value;
    }

    if (state === CellState.Flagged) {
      return value - 20;
    }

    return value + 20;
  }
}
