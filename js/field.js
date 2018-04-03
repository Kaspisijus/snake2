/* Global vars */
function FieldClass() {
  this.grid = [];
}


FieldClass.prototype = {
  initiate() {
    var gridHtml = "";

    for(var rw=0; rw < GRID_ROWS; rw++) {
      var row = [];
      for(var cl=0; cl < GRID_COLS; cl++) {
        gridHtml += '<div col="'+ cl +'" row="' + rw + '"></div>';
        row.push(0);
      }
      this.grid.push(row);
      gridHtml += '<div class="new_line"></div>';
    }
      
    $("#game_grid").html(gridHtml);
  },

  cleanGrid() {
    for(var rw=0; rw < GRID_ROWS; rw++) {
      for(var cl=0; cl < GRID_COLS; cl++) {
        this.grid[cl][rw] = 0;
      }
    }

    this.playbackInProgress = false;
    this.updateField();
  },

  // gridToInput() {
  //   var input = [];
  //   for(var rw=0; rw < GRID_ROWS; rw++) {
  //     for(var cl=0; cl < GRID_COLS; cl++) {
  //       input.push(this.grid[cl][rw]);
  //     }
  //   }
  //   return input;
  // },

  addFoodToGrid(food) {
    this.grid[food.col][food.row] = FOOD_CELL;
    // console.log("addFoodToGrid()", food.col, food.row, JSON.stringify(grid))
  },

  processCarMove(car) {
    switch(car.moveDirection) {
      case 1: car.pos.row --; break;
      case 2: car.pos.col ++; break;
      case 3: car.pos.row ++; break;
      case 4: car.pos.col --; break;
    }
    // if (showMode > 1) console.log("New pos", JSON.stringify(car.pos));

    // Check if car is not out of bounds
    if (car.pos.col < 0 || car.pos.col >= GRID_COLS || car.pos.row < 0 || car.pos.row >= GRID_ROWS) {
      car.isLive = false;
    } else {
      car.totalMoves++;
      car.addMove({
        col: car.pos.col,
        row: car.pos.row
      });
    }

    // Check if car is on food cell
    if (currentFood.col == car.pos.col && currentFood.row == car.pos.row) {
      if (showMode > 1)  console.log("FOOD FOUND")
      currentFood.isEaten = true;
      car.foodsEaten ++;
    }

    // Shift first cell
    if (car.isLive) {
      var shift = car.shiftOldestMove();
      this.grid[shift.col][shift.row] = 0;
    }
  },

  updateField() {
    for(var rw=0; rw < GRID_ROWS; rw++) {
      for(var cl=0; cl < GRID_COLS; cl++) {
        switch(this.grid[cl][rw]) {
          case EMPTY_CELL: $('div[col="'+ cl +'"][row="'+ rw +'"]').removeClass(); break;
          case CAR_CELL: $('div[col="'+ cl +'"][row="'+ rw +'"]').addClass("car_cell"); break;
          case FOOD_CELL: $('div[col="'+ cl +'"][row="'+ rw +'"]').addClass("food_cell"); break;
        }
      }
    } 
  },

  addCarToGrid(car, shiftOldestCell) {
    // Add new cell
    this.grid[car.pos.col][car.pos.row] = 1;
  },

  addReport(report) {
    // console.log("###### Generation ")

    var htmlRow = '';
    htmlRow += '<tr>';
    htmlRow += '<td>' + report.generationId + '</td>';
    htmlRow += '<td><b>' + report.avgScore + '</b></td>';
    htmlRow += '<td><b>' + report.maxScore + '</b></td>';
    htmlRow += '<td>' + report.bestCar.index + '</td>';
    htmlRow += '<td>' + report.bestCar.totalMoves + '</td>';
    htmlRow += '<td>' + report.bestCar.foodsEaten + '</td>';
    htmlRow += '<td><a href="#" onclick="replaySnake('+ report.generationId +', ' + report.bestCar.index + ')">Play</a> <input type=hidden gen="'+ report.generationId +'" carindex="' + report.bestCar.index + '"></td>';
    htmlRow += '</tr>';
    
    $('#result_table tr:last').after(htmlRow);
    $('input[gen="'+ report.generationId +'"][carindex="'+ report.bestCar.index +'"]').val( JSON.stringify(report.bestCar.gridHistory) );
  },


  playSinglemove(playBack, index) {
    if (!this.playbackInProgress) return;
    
    // Set grid values and update the view
    this.grid = playBack[index];
    this.updateField();
    console.log("Ejimas " + index, playBack[index]);
  
    if (playBack.length > index+1 ) {
      setTimeout(function() {
          Field.playSinglemove(playBack, index+1)
        }, 
        1000
      )
    } else {
      console.log("Playback finished")
      this.playbackInProgress = false;
    }
  }
}


function replaySnake(genId, carIndex) {
  var history = JSON.parse( $('input[gen="'+ genId +'"][carindex="'+ carIndex +'"]').val() );
  
  console.log("Playback started", genId, carIndex);
  console.log(history);
  Field.cleanGrid();

  Field.playbackInProgress = true;
  Field.playSinglemove(history, 0);
}



