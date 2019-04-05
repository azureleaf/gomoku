/**
 * 
 * @param {Array.<int|null>} squares 
 * @param {int} boardSize 
 * @param {int} winnerChainLength 
 * @param {int} lastMove
 * @return {string|null}
 */
export default function findWinner(squares, boardSize, winnerChainLength, lastMove) {

  // Converts array into 2D matrix for convenience
  const matrix = convertTo2D(squares);

  // scanModifiedLines();
  return scanAllLines();
  

  function scanModifiedLines(){
    const x = Math.floor(lastMove / boardSize);
    const y = lastMove % boardSize;

    console.log("point:", x, y);
  }

  function scanAllLines() {
    // Results of winner check
    // Each element represents for the check result of a line
    for (let i = 0; i < boardSize; i++) {
      let results = [];

      results.push(countChain(
        scanLine(matrix, { x: i, y: 0 }, "R")))
      results.push(countChain(
        scanLine(matrix, { x: 0, y: i }, "D")))
      results.push(countChain(
        scanLine(matrix, { x: i, y: 0 }, "DR")))
      results.push(countChain(
        scanLine(matrix, { x: 0, y: i }, "DR")))
      results.push(countChain(
        scanLine(matrix, { x: i, y: 0 }, "UR")))
      results.push(countChain(
        scanLine(matrix, { x: boardSize - 1, y: i }, "UR")
      ))

      for (var j = 0; j < results.length; j++) {
        if (results[j] != null) return results[j];
      }
    }

    // If winner is not detemined, return null
    return null;
  }

  /**
   * Convert array[boardSize*boardSize] into array[boardSize][boardSize]
   * 
   * @param {Array.<string|null>} arr 
   * @return {Array.<Array.<string|null>>}
   */
  function convertTo2D(arr) {
    var matrix = new Array(boardSize);
    for (var i = 0; i < boardSize; i++) {
      matrix[i] = new Array(boardSize);
      for (var j = 0; j < boardSize; j++) {
        matrix[i][j] = arr[i * boardSize + j];
      }
    }
    return matrix;
  }


  /**
   * Scan a line in the board
   *  from the designated point
   *  toward the designated direction
   *  until cursor reaches the edge of the board
   * Returns all the value found
   * 
   * @param {Array.<Array.<string|null>>} matrix 
   *  Two-dimension square array in the size of boardSize*boardSize
   * @param {object} origin 
   *  {x: int, y: int}
   * @param {string} direction 
   *  "R"  : toward right
   *  "D"  : toward down
   *  "DR" : toward down & right
   *  "UR" : toward up   & right
   * @return {Array.<string|null>}
   *  Extracted line
   */
  function scanLine(matrix, origin, direction) {
    var cursor = {
      x: origin.x,
      y: origin.y
    };
    var line = [];

    while (1) {
      line.push(matrix[cursor.x][cursor.y]);

      // If cursor reaches the board edge, return the line so far
      switch (direction) {
        case "R":
          if (cursor.y === boardSize - 1) return line;
          else cursor.y++;
          break;

        case "D":
          if (cursor.x === boardSize - 1) return line;
          else cursor.x++;
          break;

        case "DR":
          if (cursor.x === boardSize - 1 || cursor.y === boardSize - 1)
            return line;
          else {
            cursor.x++;
            cursor.y++;
          }
          break;

        case "UR":
          if (cursor.x === 0 || cursor.y === boardSize - 1)
            return line;
          else {
            cursor.x--;
            cursor.y++;
          }
          break;

        default:
          console.log("Error: unknown direction");
          return null;
      }
    }
  }


  /**
   * Returns winner if there's a completed stone chains
   * 
   * @param {Array.<string|null>} sequence 
   *  Sequence of a line, e.g. ["X", null, "O", "O", null, null, null]
   * @return {string|null} 
   *  If winner is confirmed:
   *    return "O" or "X"
   *  If not:
   *    return null
   */
  function countChain(sequence) {

    // "player" is any of "null", "O", "X"
    var counter = {
      player: null,
      chainLength: 0
    };

    for (var i = 0; i < sequence.length; i++) {
      if (counter.player === sequence[i]) {
        counter.chainLength++;

        // chain of "null" is meaningless for the game, then ignore it
        if (counter.player !== null && counter.chainLength >= winnerChainLength) {
          return counter.player;
        }
      } else {
        counter.player = sequence[i];
        counter.chainLength = 1;
      }
    }

    // When no chain is completed
    return null;
  }
}
