/*
  for: all lines{
    scan a line
    give score for "O" to every blank in the line
    give score for "X" to every blank in the line
  }
 
  sum up all the scores for every cell in the board
    coefficient for "advantage score" & "disturbance score" must be elaborated
    direction of the line must be considered (because some candidates is easier to deceive human opponent)
    when score is identical for several moves, decide with random number
  pick the move with the highest score
 
  machine learning: if that move was killed by human opponent followingly, reduce the pattern score
*/

export default class Brain {
  constructor(squares, boardSize, winnerChainLength) {
    this.boardSize = boardSize;
    this.matrix = this.returnMatrix(squares);
    this.winnerChainLength = winnerChainLength;
    this.scoreX = this.returnMatrix(Array(boardSize * boardSize).fill(0));
    this.scoreO = this.returnMatrix(Array(boardSize * boardSize).fill(0));

    // in the future, get patterns from the external file
    this.patterns = this.setPatterns();
  }


  /**
   *  Set all initial stone patterns to the class property.
   * 
   *  @return {Array.<Object>}
   *    Patterns list. Each row represents for a pattern.
   *    e.g.
   *      [
   *        {pattern: [0,0,1,0,1], score: [100,100,0,100,0], max: 100},
   *        {pattern: [0,1,1,1,0], score: [1000,0,0,0,1000], max: 1000},
   *        ...
   *      ]
   */
  setPatterns() {
    let patterns = new Array(Math.pow(2, this.winnerChainLength)).fill(null);
    for (let i = 0; i < patterns.length; i++) {
      let patternArr = this.returnBinaryArray(i, this.winnerChainLength);
      let scoreArr = this.returnScoreArray([...patternArr]);

      // Put pattern with higher score (like [1,1,1,1,1]) first to reduce matching iteration
      // Avoid to use Array.reverse(), they say it's way too slow
      patterns[patterns.length - i - 1] = {
        pattern: [...patternArr],
        score: [...scoreArr],
        max: this.getMax(scoreArr)
      };
    }

    // Sort patterns to avoid unnecessary matching
    // e.g.
    // When [11010] matches, trying [10000], [11000] is redundant
    // Therefore, put [11010] prior to [10000], [11000], 
    // and when [11010] is matched, abort matching to latter patterns .
    return this.sortPatterns(patterns);
  }


  /**
   * Convert position array into score array
   * Each blank cell will have the same score
   * In the future, this function will be unnecessary
   *    Score should be updated by learning algorithm
   * 
   * @param {Array.<int>} array
   *  1: Position of the stones
   *  0: Empty 
   * @return {Array.<int>}
   * 
   * e.g. 
   *  [1, 0, 0, 1, 0, 0] => [0, 100, 100, 0, 100, 100]
   *  High score means recommended position to put stone in the next move
   */
  returnScoreArray(array) {
    let stoneCounter = 0;

    // Sum the number of stones included in the pattern
    for (let i = 0; i < array.length; i++) stoneCounter += array[i];

    // Convert position pattern into evaluation pattern
    for (let i = 0; i < array.length; i++) {
      if (array[i] === 0) array[i] = Math.pow(10, stoneCounter);
      else if (array[i] === 1) array[i] = 0;
      else console.log("Error: unknown symbol in the pattern!");
    }
    return array;
  }


  /***
   * Sort patterns by the value of key "max"
   * 
   * @param {Array.<Object>} array
   */
  sortPatterns(array) {
    return array.sort((a, b) => { return b.max - a.max; });
  }


  /**
   * Convert a decimal number into binary array.
   * 
   * @param {int} num 
   *    Decimal number to be converted to binary number
   * @param {int} arrayLength
   *    Length of the array to be returned
   * @return {Array.<int>}
   *    Array of the binary number with blank digits filled with 0
   * 
   * Unused upper digit will be filled with 0.
   *    e.g.
   *      5 => [0, 0, 1, 0, 1]
   */
  returnBinaryArray(num, arrayLength) {
    var strBinary = num.toString(2);
    const strBinaryLength = strBinary.length;

    // Fill zero to the blank digit
    for (let i = 0; i < arrayLength - strBinaryLength; i++) {
      strBinary = "0" + strBinary;
    }

    // Define temporary array to return
    var array = new Array(arrayLength).fill(0);
    for (let i = 0; i < arrayLength; i++) {
      array[i] = Number(strBinary[i]);
    }
    return array;
  }


  /**
   * Get a array of numbers, return the largest value in it
   * 
   * @param {Array.<int>} array 
   */
  getMax(array) {
    let max = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] > max) max = array[i];
    }
    return max;
  }


  /**
   * 
   * @param {Array.<string|null>} arrayInRaw 
   *    This array is going to be tested if it has a matching pattern
   * @param {string} symbol
   *    "O" or "X"
   *    To determine for which player this function is going to calculate the score
   * @return {Array.<int>}
   *    Score array 
   *    e.g.
   *      input: ["X", null, null, "O", null, "O", "O", null]
   *      output: [0, 100, 1000, 2100, 0, 0, 1000]
   */
  matchPattern(arrayInRaw, symbol) {
    // Sample patterns[0] to get the length of a pattern
    // Requirement: every pattern has the same length.
    const patLen = this.patterns[0].pattern.length;

    // When input array is shorter than template patterns, 
    //   no pattern can be matched, therefore abort the process
    if (arrayInRaw.length < patLen) {
      console.log("Error: input array is shorter than template patterns!")
      return null;
    }

    // Define temporary array to return
    let arrayOut = new Array(arrayInRaw.length).fill(0);

    // Convert array format to the one which is compatible with pattern array
    // 
    // e.g. arrayInRaw = ["X", "X", null, "O"]
    //  When "symbol" is "X", this array turns into [   1,    1, 0, null]
    //  When "symbol" is "O", this array turns into [null, null, 0,    1]
    let arrayIn = arrayInRaw.map(element => {
      switch (element) {
        case symbol: return 1;
        case null: return 0;
        default: return null;
      }
    })

    // Move the start position of matching one by one
    // "cursor" moves inside input array
    for (let cursorIn = 0; cursorIn < arrayIn.length - this.winnerChainLength + 1; cursorIn++) {
      // Try to match every pattern to the array
      for (let patIndex = 0; patIndex < this.patterns.length; patIndex++) {
        for (let cursorPat = 0; cursorPat < patLen; cursorPat++) {
          // If discrepancy is found, abort matching to the latter squares, then go to next pattern
          if (arrayIn[cursorIn + cursorPat] !== this.patterns[patIndex].pattern[cursorPat]) {
            break;
          };
          // If reached the last cell of a pattern array
          if (cursorPat === patLen - 1) {
            // console.log("Matched: " + this.patterns[patIndex].pattern + " at position of " + cursorIn);
            for (let i = 0; i < arrayOut.length; i++) {
              if (this.patterns[patIndex].pattern[i] === 0)
                arrayOut[cursorIn + i] += this.patterns[patIndex].score[i];
            }
          }
        }
      }
    }
    return arrayOut;
  }


  /**
   * Convert array[boardSize*boardSize] into array[boardSize][boardSize]
   * 
   * @param {Array.<string|null>} arr 
   * @return {Array.<Array.<string|null>>}
   */
  returnMatrix(arr) {
    var matrix = new Array(this.boardSize);
    for (var i = 0; i < this.boardSize; i++) {
      matrix[i] = new Array(this.boardSize);
      for (var j = 0; j < this.boardSize; j++) {
        matrix[i][j] = arr[i * this.boardSize + j];
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
  scanLine(matrix, origin, direction) {
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
          if (cursor.y === this.boardSize - 1) return line;
          else cursor.y++;
          break;

        case "D":
          if (cursor.x === this.boardSize - 1) return line;
          else cursor.x++;
          break;

        case "DR":
          if (cursor.x === this.boardSize - 1 || cursor.y === this.boardSize - 1)
            return line;
          else {
            cursor.x++;
            cursor.y++;
          }
          break;

        case "UR":
          if (cursor.x === 0 || cursor.y === this.boardSize - 1)
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
   * 
   * @param {Array.<int|null>} squares 
   * @param {int} lastMove
   * @return {string|null}
   */
  findWinner(squares, lastMove) {

    // Converts array into 2D matrix for convenience
    const matrix = this.returnMatrix(squares);

    // scanModifiedLines();
    return this.scanAllLines(matrix);

  }

  // scanModifiedLines() {
  //   const x = Math.floor(lastMove / this.boardSize);
  //   const y = lastMove % this.boardSize;

  //   console.log("point:", x, y);
  // }


  scanAllLines(matrix) {
    // Results of winner check
    // Each element represents for the check result of a line
    for (let i = 0; i < this.boardSize; i++) {
      let results = [];

      results.push(
        this.countChain(
          this.scanLine(matrix, { x: i, y: 0 }, "R")))
      results.push(
        this.countChain(
          this.scanLine(matrix, { x: 0, y: i }, "D")))
      results.push(
        this.countChain(
          this.scanLine(matrix, { x: i, y: 0 }, "DR")))
      results.push(
        this.countChain(
          this.scanLine(matrix, { x: 0, y: i }, "DR")))
      results.push(
        this.countChain(
          this.scanLine(matrix, { x: i, y: 0 }, "UR")))
      results.push(
        this.countChain(
          this.scanLine(matrix, { x: this.boardSize - 1, y: i }, "UR")))

      for (var j = 0; j < results.length; j++) {
        if (results[j] != null) return results[j];
      }
    }

    // If winner is not detemined, return null
    return null;
  }


  /**
    * Returns winner if there's a completed stone chains
    * (In the future, this function will be necessary. Just use matchPattern() function instead)
    * 
    * @param {Array.<string|null>} sequence 
    *  Sequence of a line, e.g. ["X", null, "O", "O", null, null, null]
    * @return {string|null} 
    *  If winner is confirmed:
    *    return "O" or "X"
    *  If not:
    *    return null
    */
  countChain(sequence) {

    // "player" is any of "null", "O", "X"
    var counter = {
      player: null,
      chainLength: 0
    };

    for (var i = 0; i < sequence.length; i++) {
      if (counter.player === sequence[i]) {
        counter.chainLength++;

        // chain of "null" is meaningless for the game, then ignore it
        if (counter.player !== null && counter.chainLength >= this.winnerChainLength) {
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