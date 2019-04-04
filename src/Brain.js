export default class Brain {
  constructor(matrix, boardSize, winnerChainLength) {
    this.matrix = matrix;
    this.boardSize = boardSize;
    this.winnerChainLength = winnerChainLength;

    // Copy multidimensional array
    this.scoreMatrix = matrix.map(arr => { return [...arr] });

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

      // Put largest (like [1,1,1,1,1]) pattern first to reduce matching iteration
      // Avoid to use Array.reverse(), it's way too slow
      patterns[patterns.length - i - 1] = {
        pattern: [...patternArr],
        score: [...scoreArr],
        max: this.getMax(scoreArr)
      };
    }

    // Sort patterns to avoid unnecessary matching
    // e.g.
    // When [11010] matches, try matching to [10000], [11000], etc. is redundant
    // Therefore, put [11010] prior to [10000], [11000] etc., 
    // and when [11010] is matched, abort matching to latter patterns .
    return this.sortPatterns(patterns);
  }


  /**
   * Convert position array into score array, then returns it
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
   * Sort pattern by the key "max"
   * 
   * @param {Array.<Object>} array
   *  Array must be in the format of "this.patterns"
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
   * Get a number array, return the largest value in it
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
  * @param {int} n 
  * @return {int} factorial of n
  */
  factorial(n) {
    if (n !== 0) return n * (n - 1);
    else return 1;
  }


  /**
   * 
   * @param {Array.<string|null>} arrayRaw 
   *    This array is going to be tested if it has a matching pattern
   * @param {string} symbol
   *    "O" or "X"
   *    To determine for which player this function is going to calculate the score
   * @return {void}
   */
  matchPattern(arrayRaw, symbol) {
    // Sample patterns[0] to get the length of a pattern
    //   assumption: every pattern has the same length 
    const patLen = this.patterns[0].pattern.length;

    // When input array is shorter than template patterns, 
    //   no pattern can be matched, therefore abort the process
    if (arrayRaw.length < patLen) {
      console.log("Error: input array is shorter than template patterns.")
      return null;
    }

    // Convert array format to the one which is compatible with pattern array
    // 
    // e.g. arrayRa w = ["X", "X", null, "O"]
    //  When symbol is "X", this array turns into [   1,    1, 0, null]
    //  When symbol is "O", this array turns into [null, null, 0,    1]
    let array = arrayRaw.map(element => {
      switch (element) {
        case symbol: return 1;
        case null: return 0;
        default: return null;
      }
    })

    // Move the start position of matching one by one
    for (let cursor = 0; cursor < array.length - this.winnerChainLength; cursor++) {

      // Match every pattern to the array
      for (let patIndex = 0; patIndex < this.patterns.length; patIndex++) {

        for (let patCursor = 0; patCursor < patLen; patCursor++) {
          // If discrepancy is found, abort matching the pattern
          if (array[cursor] !== this.patterns[patIndex].pattern[patCursor]) {
            console.log("aborted");
            break;
          };

          // If reached the end of pattern
          if (patCursor === patLen - 1) {
            return "matched! pattern: " + this.patterns[patIndex].pattern + " at position of " + cursor;
          }
        }
      }
    }

    // If no match found (this is unlikely)
    return null;
  }


  nextMove(squares) {
    /*
      array: candidates[][]
      associative array: patternTable
        "x1111": 100,
        "1x111": 100,
        "11x11": 100,
        "0x1110": 100,
        "011x10": 100,
        "0x111": 70
        "001x00": 5
        "0010x0": 3
        "00100x0": 2
   
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

    return 0;
  }

}