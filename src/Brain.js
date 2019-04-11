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
  constructor(boardSize, winnerChainLength, aggressivness) {
    this.boardSize = boardSize;
    this.winnerChainLength = winnerChainLength;
    this.aggressivness = aggressivness;
    this.scoreMatrix = {
      playerX: this.returnMatrix(Array(boardSize * boardSize).fill(0)),
      playerO: this.returnMatrix(Array(boardSize * boardSize).fill(0))
    }

    // in the future, get patterns from the external file
    this.patterns = this.setPatterns();
  }


  /**
   *  Set all initial stone patterns to the class property.
   * 
   *  @return {Array.<Object>}
   *    Patterns list. Each row represents for a pattern.
   *    example:
   *      [
   *        {pattern: [0,0,1,0,1], score: [100,100,0,100,0], max: 100},
   *        {pattern: [0,1,1,1,0], score: [1000,0,0,0,1000], max: 1000},
   *        ...
   *      ]
   */
  setPatterns() {

    // Set the number of patterns here. 
    // e.g. When player needs 3 stone chains to win, there're 2*2*2 = 8 pattern varieties.
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

    // test
    console.log(this.sortPatterns(patterns));    

    // Sort patterns to avoid unnecessary matching
    // e.g.
    // When [11010] matches, furtherly matching [10000], [11000] is redundant
    // Therefore, put [11010] prior to [10000], [11000], 
    // and when [11010] is matched, abort matching to latter patterns .    
    return this.sortPatterns(patterns);
  }

  /**
   * Returns next move information judged from the current board
   * 
   * @param {Array.<str|null>} array 
   * @param {str} nextPlayer 
   */
  calculateScore(array, nextPlayer) {

    const prevPlayer = (nextPlayer === "X") ? "O" : "X";

    // convert 1D array into 2D 
    const matrix = this.returnMatrix(array);

    // Score matrix for both players
    let scoreMatrix = {
      O: this.returnScoreMatrix(matrix, "O"),
      X: this.returnScoreMatrix(matrix, "X")
    }

    // Object to return
    let nextMove = {
      next: nextPlayer,
      row: null,
      col: null,
      score: 0
    }

    // Find the square with the highest score
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

  returnScoreMatrix(matrix, player) {
    let scoreMatrix = this.returnMatrix(Array(this.boardSize * this.boardSize).fill(0));

    let results = [];

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

    for (let i = 0; i < results.length; i++) {
      scoreMatrix[results[i].row][results[i].col] += results[i].score;
    }

    // test
    console.log(player, " score: ", scoreMatrix);

    return scoreMatrix;
  }


  // NOT USED
  /**
   * 
   * @param {Array.<>} array 
   * @param {int} lastMove 
   *  Position of square
   * @param {str} lastPlayer 
   */
  updateScore(array, lastMove, lastPlayer) {

    // convert 1D array notation into 2D one
    const matrix = this.returnMatrix(array);

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
      else console.log("Error: unknown symbol in the pattern: ", array[i]);
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
   * @param {Object} scanObj
   *    array of {row: <int>, col: <int>, value: <str|null>}
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
    // Sample patterns[0] to get the length of a pattern
    const patLen = this.patterns[0].pattern.length;


    let scoreObj = [];

    // When input array is shorter than template patterns, 
    //   no pattern will be matched, therefore abort the process
    if (scanObj.length < patLen) return scoreObj;


    // Real copy of object array
    // let scoreObj = scanObj.map(obj => { return Object.assign({}, obj) });
    // console.log(scoreObj);


    // Convert array format to the one which is compatible with pattern array
    // 
    // e.g. arrayInRaw = ["X", "X", null, "O"]
    //  When "symbol" is "X", this array turns into [   1,    1, 0, null]
    //  When "symbol" is "O", this array turns into [null, null, 0,    1]


    for (let i = 0; i < scanObj.length; i++) {

      // convert format
      switch (scanObj[i].value) {
        case symbol: scanObj[i].value = 1; break;
        case null: scanObj[i].value = 0; break;
        default: scanObj[i].value = null; break;
      }

      // make scoreObj
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
    var scanResult = [];

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
   * 
   * @param {Array.<Array.<string|null>>} matrix 
   * @param {int} lastMove 
   */
  scanModifiedLines(matrix, lastMove) {
    // convert 1D array notation into 2D one
    const row = Math.floor(lastMove / this.boardSize);
    const col = lastMove % this.boardSize;

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


  /** FUNCTION BELOW IS NOT USED **/
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
    * @param {} scanObj 
    *  
    * @return {string|null} 
    *  If winner is confirmed:
    *    return "O" or "X"
    *  If not:
    *    return null
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

        // chain of "null" is meaningless for the game, then ignore it
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