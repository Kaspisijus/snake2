
/** Rename vars */
var Neat    = neataptic.Neat;
var Methods = neataptic.Methods;
var Config  = neataptic.Config;
var Architect = neataptic.Architect;

/** Turn off warnings */
Config.warnings = false;
const DEBUG = 3;
const HALF_DEBUG = 2;
const LIVE = 1;
var showMode = LIVE;

/** Settings */
var POPULATION_SIZE     = 1;
var MAX_GENS     = 1;
var MUTATION_RATE     = 0.2;
var ELITISM_PERCENT   = 0.3;

const MAX_MOVES     = 100;
const MAX_FOODS     = 10;


// Global vars
var neat, cars, carIndex, bestCar, Field;
var foods, foodIndex, currentFood;
var allTimeBestMaxScore = 0;
var allTimeBestAvgScore = 0;
var lastPopAvgScore = 0;

// Field
const FOOD_CELL = 0.5;
const CAR_CELL = 1;
const EMPTY_CELL = 0;
const GRID_COLS = 5, GRID_ROWS = 5;

// asdf
/** Construct the genetic algorithm */
function initNeat(){
  neat = new Neat(
    GRID_COLS*GRID_ROWS,
    4,
    function () {
      console.log("Using default fitness function")
    },
    {
      mutation: [
        Methods.Mutation.ADD_NODE,
        Methods.Mutation.SUB_NODE,
        Methods.Mutation.ADD_CONN,
        Methods.Mutation.SUB_CONN,
        Methods.Mutation.MOD_WEIGHT,
        Methods.Mutation.MOD_BIAS,
        Methods.Mutation.MOD_ACTIVATION,
        Methods.Mutation.ADD_GATE,
        Methods.Mutation.SUB_GATE,
        Methods.Mutation.ADD_SELF_CONN,
        Methods.Mutation.SUB_SELF_CONN,
        Methods.Mutation.ADD_BACK_CONN,
        Methods.Mutation.SUB_BACK_CONN
      ],
      popsize: POPULATION_SIZE,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION_SIZE)
    }
  );
}


/** Start the evaluation of the current generation */
function startEvaluation(){

  // Reset car list
  cars = [];
  carIndex = 0
  bestCar = null;
  neat.population.forEach(genome =>{
    cars.push(new Car(genome, carIndex))
    carIndex++;
  })


  // Generate foods
  foods = [];
  currentFood = null;
  for(var i = 0; i < MAX_FOODS; i++){
    foods.push(new Food())
  }

  // Loop units for a game
  cars.forEach(car => {
    if (showMode > 1) console.log("#### Car ", car.index);
    foodIndex = 0;
    currentFood = null;
    Field.cleanGrid();

    // Loop through food
    while(serveFood() && car.totalMoves < MAX_MOVES && car.isLive) {
      if (showMode > 1) console.log("## Food ", currentFood)
      currentFood.reset();
      Field.addFoodToGrid(currentFood, false);

      // Loop through activated moves
      while(!currentFood.isEaten && car.totalMoves < MAX_MOVES && car.isLive) {
          car.activateForDirection();
          Field.processCarMove(car);
          car.gridHistory.push( arrayClone(Field.grid) );
      }
    }

    // Calculate fitness
    car.brain.score =  Math.round(car.totalMoves / MAX_MOVES) * 5;
    car.brain.score += car.foodsEaten * 10;
    // car.brain.score += (car.isLive) ? 3 : 0;
    if (showMode > 1) console.log("Fitness", car.brain.score);

    // Check if current car is the best one
    if (bestCar == null || bestCar.brain.score < car.brain.score) bestCar = car;
  
  })  
 
  // console.log("Track ["+ trackIndex +"]:", track);

  endEvaluation();
}

/** End the evaluation of the current generation */
function endEvaluation(){

  Field.addReport({
    generationId: neat.generation,
    avgScore: neat.getAverage(),
    maxScore: bestCar.brain.score,
    bestCar: bestCar
  });

  // add random value for elites and resort in case there would be equal scores
  for(var i = 0; i < neat.elitism; i++){
    neat.population[i].score += Math.random();
    // console.log("elite " + i + ": ", neat.population[i].score)
  }
  neat.sort();

  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
  neat.highestScore = 0;

  if (neat.generation < MAX_GENS) startEvaluation();
}



function serveFood() {
  if (foodIndex == null) foodIndex = 0;
  else foodIndex++;

  if (foodIndex < foods.length) {
    currentFood = foods[foodIndex];
    return true;
  }
  else {
    currentFood = null;
    return false;
  }
}


function startLearning() {
  // var POPULATION_SIZE     = 1;
  // var MAX_GENS     = 1;
  // var MUTATION_RATE     = 0.1;
  // var ELITISM_PERCENT   = 0.4;

  POPULATION_SIZE = $('#pop_size').val()
  MAX_GENS = $('#generations').val()

  console.log("startLearning()");

  // initiate NEAT network
  initNeat();

  // Create Field object
  Field = new FieldClass();
  Field.initiate();

  // Do some initial mutation
  for(var i = 0; i < 100; i++) neat.mutate();

  startEvaluation();
}


function arrayClone(sourceArray) {
  return JSON.parse(JSON.stringify(sourceArray));
}