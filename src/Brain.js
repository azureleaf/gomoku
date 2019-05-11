export default class Brain {
  constructor(boardSize, winnerChainLength, aggressivness) {
    this.boardSize = boardSize;
    this.winnerChainLength = winnerChainLength;

    // With higher aggressiveness, 
    // the computer player ignores the advantageous move 
    // made by the opponent human player more frequently
    this.aggressivness = aggressivness;

    this.scoreMatrix = {
      playerX: this.returnMatrix(Array(boardSize * boardSize).fill(0)),
      playerO: this.returnMatrix(Array(boardSize * boardSize).fill(0))
    }

    // In the future, for code mobility purpose,
    // consider to store patterns in the external file
    this.patterns = this.setPatterns();
  }


  /**
   *  Set stone patterns as the class property
   * 
   *  @return {Array.<Object>}
   *    Patterns list. Each row represents for a pattern
   *    example:
   *      [
   *        {pattern: [0,0,1,0,1], score: [100,100,0,100,0], max: 100},
   *        {pattern: [0,1,1,1,0], score: [1000,0,0,0,1000], max: 1000},
   *        ...
   *      ]
   */
  setPatterns() {
    // Set the number of patterns here. 
    // e.g. 
    //    When player needs 3 stone chains to win, 
    //    there're 2*2*2 = 8 pattern varieties
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

    // TEST USE
    console.log(this.sortPatterns(patterns));    

    // Sort patterns to avoid unnecessary matching
    // e.g.
    // When [11010] matches, furtherly matching [10000], [11000] is redundant,
    // because they always matches in that case.
    // Therefore, put [11010] prior to [10000], [11000], 
    // and when [11010] is matched, abort matching to latter patterns.    
    return this.sortPatterns(patterns);
  }


  /**
   * Returns next move information judged from the current board
   * 
   * @param {Array.<str|null>} array 
   * @param {str} nextPlayer 
   * @return {Object}
   */
  calculateScore(array, nextPlayer) {

    const prevPlayer = (nextPlayer === "X") ? "O" : "X";

    // Convert 1D array into 2D 
    const matrix = this.returnMatrix(array);

    // Score matrix for both players
    let scoreMatrix = {
      O: this.returnScoreMatrix(matrix, "O"),
      X: this.returnScoreMatrix(matrix, "X")
    }

    // Define the object to return
    let nextMove = {
      next: nextPlayer,
      row: null,
      col: null,
      score: 0
    }

    // Find which square has the highest score in the board
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        var combineScore =
          scoreMatrix[nextPlayer][i][j] * this.aggressivness
          + scoreMatrix[prevPlayer][i][j];
        if (combineScore > nextMove.score) {
          nextMove.row = i;
          nextMove.col = j;
          nextMove.score = combineScore;
        }
      }
    }
    
    return nextMove;
  }


  /**
   * Return matrix of scores, for each square in the board
   * @param {*} matrix 
   * @param {*} player 
   * @return {Array.<>}
   */
  returnScoreMatrix(matrix, player) {
    // Define the board which has the same size as a board
    // and give a score to the every square in the board
    let scoreMatrix = this.returnMatrix(Array(this.boardSize * this.boardSize).fill(0));

    // Each element in this array reprensents for
    //    a score array for the scanned single line
    let results = [];

    // Check 5 directions a time, and repeat it for whole board length
    for (let i = 0; i < this.boardSize; i++) {
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: i, y: 0 }, "R"), player))
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: 0, y: i }, "D"), player))
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: i, y: 0 }, "DR"), player))
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: 0, y: i }, "DR"), player))
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: i, y: 0 }, "UR"), player))
      results = results.concat(
        this.matchPattern(
          this.scanLine(matrix, { x: this.boardSize - 1, y: i }, "UR"), player))
    }

    // Register those scan results to the final score matrix, square by square
    for (let i = 0; i < results.length; i++) {
      scoreMatrix[results[i].row][results[i].col] += results[i].score;
    }

    // FOR TEST USE
    console.log(player, " score: ", scoreMatrix);

    return scoreMatrix;
  }


  // NOT USED FOR NOW: FOR FUTURE FEATURE
  // TO AVOID THE UNNECESSARY CALCULATION AND FOLLOWING SLOW WEBSITE PERFOMARNCE
  /**
   * Update the some squares of score matrix only
   * which are affected by the last move
   * 
   * @param {Array.<>} array 
   * @param {int} lastMove 
   *  Position of square (comes in 1D notation in the board)
   * @param {str} lastPlayer 
   * 
   */
  updateScore(array, lastMove, lastPlayer) {

    // Convert the board: from 1D array notation into 2D one
    const matrix = this.returnMatrix(array);

    // Convert the index of the last move: from 1D notation to 2D one
    const row = Math.floor(lastMove / this.boardSize);
    const col = lastMove % this.boardSize;
    
    let newScore = [];

    newScore = newScore.concat(this.matchPattern(
      this.scanLine(matrix, {
        x: row,
        y: 0
      }, "R"), lastPlayer
    ))

    newScore = newScore.concat(this.matchPattern(
      this.scanLine(matrix, {
        x: 0,
        y: col
      }, "D"), lastPlayer
    ))

    newScore = newScore.concat(this.matchPattern(
      this.scanLine(matrix, {
        x: (row - col > 0) ? row - col : 0,
        y: (row - col > 0) ? 0 : col - row
      }, "DR"), lastPlayer
    ))

    newScore = newScore.concat(this.matchPattern(
      this.scanLine(matrix, {
        x: (this.boardSize - 1 - row - col > 0) ? row + col : this.boardSize - 1,
        y: (this.boardSize - 1 - row - col > 0) ? 0 : col - (this.boardSize - 1 - row)
      }, "UR"), lastPlayer
    ))

    newScore = newScore.concat(this.matchPattern(
      this.scanLine(matrix, {
        x: (this.boardSize - 1 - row - col > 0) ? row + col : this.boardSize - 1,
        y: (this.boardSize - 1 - row - col > 0) ? 0 : col - (this.boardSize - 1 - row)
      }, "UR"), lastPlayer
    ))

    for (let i = 0; i < newScore.length; i++) {
      switch (lastPlayer) {
        case "O":
          this.scoreMatrix.playerO[newScore[i].row][newScore[i].col] = newScore[i].score;
          break;
        case "X":
          this.scoreMatrix.playerX[newScore[i].row][newScore[i].col] = newScore[i].score;
          break;
        default:
          console.log("Error: Unknown player symbol: ", lastPlayer);
          break;
      }
    }
  }


  /**
   * Convert position array into score array based on patterns
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
      else console.log("Error: unknown symbol in the pattern: ", array[i]);
    }
    return array;
  }

  /***
   * Sort patterns by the value of key "max"
   * 
   * @param {Array.<Object>} array
   *    Each elemental object in this array must have the key "max"
   * @return {Array.<Object>} 
   *    Array sorted by "max" key
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
   *      5 => 101 => [0, 0, 1, 0, 1]
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
   * @return {int}
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
   * @param {Object} scanObj
   *    array of dictionary: {row: <int>, col: <int>, value: <str|null>}
   *    a dictionary represents for a square (position & its value)
   * @param {string} symbol
   *    "O" or "X"
   *    To determine for which player this function is going to calculate the score
   * @return {Array.<int>}
   *    Score array 
   *    e.g.
   *      input: ["X", null, null, "O", null, "O", "O", null], symbol: "O"
   *      output: [0, 100, 1000, 2100, 0, 0, 1000]
   */
  matchPattern(scanObj, symbol) {

    // Sampling patterns[0] to get the length of a pattern
    const patLen = this.patterns[0].pattern.length;

    let scoreObj = [];

    // When input array is shorter than template patterns, 
    //   no pattern will be matched, therefore abort the process
    if (scanObj.length < patLen) return scoreObj;

    // Convert array format to the one which is compatible with pattern array
    // e.g. Given that values in scanObj are like ["X", "X", null, "O"],
    //    When "symbol" is "X", this array turns into [   1,    1, 0, null]
    //    When "symbol" is "O", this array turns into [null, null, 0,    1]

    for (let i = 0; i < scanObj.length; i++) {

      // Convert format
      switch (scanObj[i].value) {
        case symbol: scanObj[i].value = 1; break;
        case null: scanObj[i].value = 0; break;
        default: scanObj[i].value = null; break;
      }

      // Make scoreObj
      scoreObj.push({
        row: scanObj[i].row,
        col: scanObj[i].col,
        score: 0
      })
    }

    // Move the start position of matching one by one
    // "cursor" moves inside input array
    for (let cursorObj = 0; cursorObj < scanObj.length - this.winnerChainLength + 1; cursorObj++) {
      
      // Try to match every pattern to the array
      for (let patIndex = 0; patIndex < this.patterns.length; patIndex++) {
      
        // Try to match every position in a pattern
        for (let cursorPat = 0; cursorPat < patLen; cursorPat++) {
      
          // If discrepancy is found, abort matching to the remainder, then go to next pattern
          if (scanObj[cursorObj + cursorPat].value !== this.patterns[patIndex].pattern[cursorPat]) break;

          // If reached the last cell of a pattern array
          if (cursorPat === patLen - 1) {

            for (let i = 0; i < scoreObj.length; i++) {
              // If that cell is blank, set score
              if (this.patterns[patIndex].pattern[i] === 0)
                scoreObj[cursorObj + i].score += this.patterns[patIndex].score[i];
            }
          }
        }
      }
    }

    return scoreObj;
  }


  /**
   * Convert array[boardSize*boardSize] into array[boardSize][boardSize]
   * 
   * @param {Array.<string|null>} arr 
   * @return {Array.<Array.<string|null>>}
   */
  returnMatrix(arr) {
    var matrix = new Array(this.boardSize).fill(null);
    for (var i = 0; i < this.boardSize; i++) {
      matrix[i] = new Array(this.boardSize).fill(null);
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
   * Then returns all the value found
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

    // Position and content of each square (O, X, or null)
    //  is going to be pushed to this array one by one
    var scanResult = [];

    // When the cursor reaches the edge, return san result 
    while (1) {
      scanResult.push({
        row: cursor.x,
        col: cursor.y,
        value: matrix[cursor.x][cursor.y]
      })

      // If cursor reaches the board edge, return the line so far
      switch (direction) {
        case "R":
          if (cursor.y === this.boardSize - 1) return scanResult;
          else cursor.y++;
          break;

        case "D":
          if (cursor.x === this.boardSize - 1) return scanResult;
          else cursor.x++;
          break;

        case "DR":
          if (cursor.x === this.boardSize - 1 || cursor.y === this.boardSize - 1)
            return scanResult;
          else {
            cursor.x++;
            cursor.y++;
          }
          break;

        case "UR":
          if (cursor.x === 0 || cursor.y === this.boardSize - 1)
            return scanResult;
          else {
            cursor.x--;
            cursor.y++;
          }
          break;

        default:
          console.log("Error: unknown direction: ", direction);
          return null;
      }
    }
  }


  /**
   * NOT USED FOR NOW
   * Get board information, then will return winner if found
   * 
   * @param {Array.<int|null>} squares 
   * @param {int} lastMove
   * @return {string|null}
   */
  findWinner(squares, lastMove) {

    // Converts array into 2D matrix for convenience
    const matrix = this.returnMatrix(squares);

    return this.scanModifiedLines(matrix, lastMove);
    // return this.scanAllLines(matrix);

  }


  /**
   * Get board information, returns the winner if found
   * 
   * @param {Array.<Array.<string|null>>} matrix 
   * @param {int} lastMove 
   * @return {string} 
   */
  scanModifiedLines(matrix, lastMove) {
    // Convert 1D array notation into 2D one
    const row = Math.floor(lastMove / this.boardSize);
    const col = lastMove % this.boardSize;

    // Array to store the result of winner search
    // 
    let winner = [];

    winner.push(this.countChain(
      this.scanLine(matrix, { x: row, y: 0 }, "R")
    ));
    winner.push(this.countChain(
      this.scanLine(matrix, { x: 0, y: col }, "D")
    ));
    winner.push(this.countChain(
      this.scanLine(matrix, {
        x: (row - col > 0) ? row - col : 0,
        y: (row - col > 0) ? 0 : col - row
      }, "DR")
    ));
    winner.push(this.countChain(
      this.scanLine(matrix, {
        x: (this.boardSize - 1 - row - col > 0) ? row + col : this.boardSize - 1,
        y: (this.boardSize - 1 - row - col > 0) ? 0 : col - (this.boardSize - 1 - row)
      }, "UR")
    ));

    // Check if winner is found or not
    for (let i = 0; i < winner.length; i++) {
      if (winner[i]) return winner[i];
    }

    // When winner isn't confirmed
    return null;
  }


  /** FUNCTION BELOW IS NOT USED (BECAUSE OF LOW PERFORMANCE)**/
 /**
  * 
  * @param {Array.<Array.<str|null>>} matrix 
  * @return {str|null}
  */ 
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
    * Get a single line data, returns winner if there's a completed stone chains
    * 
    * @param {Object} scanObj 
    *   array of dictionary {row: <int>, col: <int>, value: <str|null>}
    *   a dictionary represents for a square (position & its value)
    * @return {string|null} 
    *  If winner is confirmed:
    *    return "O" or "X"
    *  If not:
    *    return null
    * 
    *   (In the future, this function will be necessary.
    *    Just use matchPattern() function instead)
    */
  countChain(scanObj) {

    // "player" is any of "null", "O", "X"
    var counter = {
      player: null,
      chainLength: 0
    };

    for (var i = 0; i < scanObj.length; i++) {
      if (counter.player === scanObj[i].value) {
        counter.chainLength++;

        // Chain of "null" is meaningless for the game, then ignore it
        if (counter.player !== null && counter.chainLength >= this.winnerChainLength) {
          return counter.player;
        }
      } else {
        counter.player = scanObj[i].value;
        counter.chainLength = 1;
      }
    }

    // When no chain is completed
    return null;
  }
}