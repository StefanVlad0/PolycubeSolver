/**
 * Dancing Links (Knuth's Algorithm X) exact-cover solver.
 *
 * Columns are all mandatory. Rows are added via `addRow` with the list of
 * column indices they cover. `solve` invokes `onSolution` with the list of row
 * ids that form each exact cover; return `false` from the callback (or hit the
 * internal caps) to stop early.
 */
export class DLX {
  private L: number[] = [];
  private R: number[] = [];
  private U: number[] = [];
  private D: number[] = [];
  private col: number[] = [];
  private rowId: number[] = [];
  private size: number[] = [];
  private readonly header = 0;

  constructor(numCols: number) {
    // Node 0 is the root; nodes 1..numCols are column headers.
    for (let i = 0; i <= numCols; i++) {
      this.push();
      this.L[i] = i - 1 < 0 ? numCols : i - 1;
      this.R[i] = i + 1 > numCols ? 0 : i + 1;
      this.U[i] = i;
      this.D[i] = i;
      this.col[i] = i;
      this.size[i] = 0;
      this.rowId[i] = -1;
    }
    this.L[0] = numCols;
    this.R[0] = numCols === 0 ? 0 : 1;
    this.R[numCols] = 0;
    this.L[1 <= numCols ? 1 : 0] = 0;
  }

  private push(): number {
    const idx = this.L.length;
    this.L.push(0);
    this.R.push(0);
    this.U.push(0);
    this.D.push(0);
    this.col.push(0);
    this.rowId.push(0);
    this.size.push(0);
    return idx;
  }

  addRow(rowId: number, columns: number[]): void {
    if (columns.length === 0) return;
    let first = -1;
    let prev = -1;
    for (const c0 of columns) {
      const c = c0 + 1; // column header index (1-based)
      const n = this.push();
      this.rowId[n] = rowId;
      this.col[n] = c;
      // Insert into column c (above header, i.e. at the bottom).
      const up = this.U[c];
      this.U[n] = up;
      this.D[n] = c;
      this.D[up] = n;
      this.U[c] = n;
      this.size[c]++;
      // Link horizontally.
      if (first === -1) {
        first = n;
        this.L[n] = n;
        this.R[n] = n;
      } else {
        this.L[n] = prev;
        this.R[n] = first;
        this.R[prev] = n;
        this.L[first] = n;
      }
      prev = n;
    }
  }

  private cover(c: number): void {
    this.R[this.L[c]] = this.R[c];
    this.L[this.R[c]] = this.L[c];
    for (let i = this.D[c]; i !== c; i = this.D[i]) {
      for (let j = this.R[i]; j !== i; j = this.R[j]) {
        this.U[this.D[j]] = this.U[j];
        this.D[this.U[j]] = this.D[j];
        this.size[this.col[j]]--;
      }
    }
  }

  private uncover(c: number): void {
    for (let i = this.U[c]; i !== c; i = this.U[i]) {
      for (let j = this.L[i]; j !== i; j = this.L[j]) {
        this.size[this.col[j]]++;
        this.U[this.D[j]] = j;
        this.D[this.U[j]] = j;
      }
    }
    this.R[this.L[c]] = c;
    this.L[this.R[c]] = c;
  }

  /**
   * Search for exact covers.
   * @param onSolution Called with row ids of a solution. Return false to stop.
   * @param onNode Optional per-node callback for progress; return false to stop.
   */
  solve(
    onSolution: (rows: number[]) => boolean,
    onNode?: (nodes: number) => boolean,
  ): void {
    const solution: number[] = [];
    let nodes = 0;
    let stop = false;

    const search = (): void => {
      if (stop) return;
      if (this.R[this.header] === this.header) {
        if (!onSolution(solution.slice())) stop = true;
        return;
      }
      // Choose column with the smallest size (S heuristic).
      let c = this.R[this.header];
      let best = this.size[c];
      for (let j = this.R[this.header]; j !== this.header; j = this.R[j]) {
        if (this.size[j] < best) {
          best = this.size[j];
          c = j;
        }
      }
      if (best === 0) return; // dead end
      this.cover(c);
      for (let r = this.D[c]; r !== c && !stop; r = this.D[r]) {
        solution.push(this.rowId[r]);
        for (let j = this.R[r]; j !== r; j = this.R[j]) this.cover(this.col[j]);

        nodes++;
        if (onNode && (nodes & 0x3fff) === 0) {
          if (!onNode(nodes)) stop = true;
        }

        if (!stop) search();

        for (let j = this.L[r]; j !== r; j = this.L[j]) this.uncover(this.col[j]);
        solution.pop();
      }
      this.uncover(c);
    };

    search();
  }
}
