function Car(genome, carIndex){
  this.brain = genome;
  this.brain.score = 0;
  this.isLive = true;
  
  this.totalMoves = 0;
  this.foodsEaten = 0;
  this.index = carIndex;

  this.pos = {col: 2, row: 2};
  this.cells = [{col: 2, row: 2}];
  this.gridHistory = [];

  this.moveDirection = 3; //clock
}


Car.prototype = {

  activateForDirection() {
    var input = Field.gridToInput();
    var output = this.brain.activate(input);
    this.moveDirection = indexOfMax(output) + 1;
    // console.log("Activation", input, output, this.moveDirection)
  },

  addMove(move) {
    this.cells.push(move);
    Field.addCarToGrid(this);
  },

  shiftOldestMove() {
    // console.log("Cells before shift", JSON.stringify(this.cells))
    return this.cells.shift();
  },

  getRelativeField() {
    var relativeField = [];

    var rowRadius = Math.floor(GRID_COLS / 2);
    var colRadius = Math.floor(GRID_ROWS / 2);
  
    for(var rw=(this.pos.row - rowRadius); rw <= (this.pos.row + rowRadius); rw++) {
      var row = [];
      for(var cl=(this.pos.col - colRadius); cl <= (this.pos.col + colRadius); cl++) {
        if (this.grid[cl][rw] == "undefined") {
          row.push(2);
        } else {
          row.push(this.grid[cl][rw]);
        }
      }
      relativeField.push(row);
    }

    console.log("Original", Field.grid, "Relative", relativeField)

    return relativeField;
  },
};




function Food(){
  this.col = Math.floor(Math.random() * GRID_COLS);
  this.row = Math.floor(Math.random() * GRID_ROWS);
  this.isEaten = false;
  // console.log("New food", this.col, this.row)
}

Food.prototype = {
  isEaten(position) {
    console.log("CHECKAS")
  },
  reset() {
    this.isEaten = false;
  }
}

function Move(col, row) {
  this.row = row;
  this.col = col;
}


function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}