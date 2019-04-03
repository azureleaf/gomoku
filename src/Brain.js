export default class Brain {
  constructor(matrix, boardSize, winnerChainLength) {
    this.matrix = matrix;
    this.boardSize = boardSize;
    this.winnerChainLength = winnerChainLength;

    // Copy multidimensional array
    this.scoreMatrix = matrix.map(arr => { return [...arr] });

    this.patterns = this.generatePatterns();
  }


  /**
   *  @param {int} winnerChainLength
   *    Length of a pattern to check.
   *  @return {Array.<Object>}
   *    Patterns list. Each row represents for a pattern.
   *    e.g.
   *      [
   *        {pattern: [0,0,1,0,1], score: [100,100,0,100,0]},
   *        {pattern: [0,1,1,1,0], score: [1000,0,0,0,1000]},
   *        ...
   *      ]
   */
  generatePatterns() {

    /**
     *  main
     */
    let patterns = new Array(Math.pow(2, this.winnerChainLength)).fill(null);
    for (var i = 0; i < patterns.length; i++) {
      var pat = returnBinaryArray(i, this.winnerChainLength);
      patterns[i] = {
        pattern: [...pat],
        score: generatePattern(pat)
      };
    }
    return patterns;

    /**
     * Convert pattern array into 
     * 
     * @param {Array.<int>} array
     *  1: Position of the stones
     *  0: Empty 
     * @return {Array.<int>}
     * 
     * e.g. 
     *  [1, 0, 0, 1, 0, 0] => [0, 100, 100, 0, 100, 100]
     */
    function generatePattern(array) {

      let stoneCounter = 0;

      // Sum the number of stones in the pattern
      for (let i = 0; i < array.length; i++) stoneCounter += array[i];

      // Convert position pattern into evaluation pattern
      for (let i = 0; i < array.length; i++) {
        if (array[i] === 0) array[i] = Math.pow(10, stoneCounter);
        else if (array[i] === 1) array[i] = 0;
        else console.log("Error: unknown symbol in the pattern!");
      }
      return array;
    }


    /**
     * Convert a number into binary array.
     * Unused upper digit will be filled with 0.
     *    e.g.
     *      5 => [0, 0, 1, 0, 1]
     * @param {int} num 
     *    Decimal number to be converted to binary number
     * @param {int} arrayLength
     *    Length of the array to be returned
     * @return {Array.<int>}
     *    Array of the binary number with blank digits filled with 0
     */
    function returnBinaryArray(num, arrayLength) {
      var strBinary = num.toString(2);
      const strBinaryLength = strBinary.length;

      // Fill zero to the blank digit
      for (let i = 0; i < arrayLength - strBinaryLength; i++) {
        strBinary = "0" + strBinary;
      }

      // Array to return
      var array = new Array(arrayLength).fill(0);

      for (let i = 0; i < arrayLength; i++) {
        array[i] = Number(strBinary[i]);
      }

      return array;
    }
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
   */
  matchPattern(arrayRaw, symbol) {

    // Convert array format
    // e.g. array = ["X", "X", null, "O"]
    //  When symbol is "X", array turns into [   1,    1, 0, null]
    //  When symbol is "O", array turns into [null, null, 0,    1]
    let array = arrayRaw.map(element => {
      switch (element) {
        case symbol: return 1;
        case null: return 0;
        default: return null;
      }
    })


    for (let origin = 0; origin < array.length - this.winnerChainLength; origin++) {
      for (let patternIndex = 0; patternIndex < this.patterns.length; patternIndex++) {
        if (array[origin] == null && this.patterns.pattern[patternIndex] === 1) return;
      }
    }
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

  }

}