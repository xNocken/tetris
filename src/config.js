import variables from './scss/variables.scss';

let variablesNew = {};

Object.entries(variables).forEach(([key, value]) => {
  const names = key.split('-');
  const object = variablesNew;
  let lastobject = object;
  let lastName = '';

  names.forEach((name, index) => {
    if (lastName === '') {
      if (index + 1 === names.length) {
        lastobject[name] = parseInt(value, 10);
      } else {
        if (!lastobject[name]) {
          lastobject[name] = {};
        }

        lastName = name;
      }
    } else if (index + 1 === names.length) {
      lastobject[lastName][name] = parseInt(value, 10);
    } else {
      if (!lastobject[lastName][name]) {
        lastobject[lastName][name] = {};
      }

      lastobject = lastobject[lastName];
      lastName = name;
    }
  });

  variablesNew = object;
});

const {
  margin,
  border,
  height,
} = variablesNew.block;


const blocks = {
  lLeft: [
    [1, 0],
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  lRight: [
    [0, 1],
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  block: [
    [1, 1],
    [1, 1],
  ],
  long: [
    [1],
    [1],
    [1],
    [1],
  ],
  smallT: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  uhm: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  cross: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  longUhm: [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
};

const config = {
  moveHeight: margin + (border * 2) + height,
  blockstyle: {
    height,
    border,
    margin,
  },
  colors: [
    'yellow',
    'green',
    'blue',
  ],
};

let gameState = {};

export const getConfig = key => config[key];
export const getBlock = block => blocks[block];
export const getGameState = key => gameState[key];
export const getBlockNames = () => Object.keys(blocks);

export const setGameState = (newGameStates) => {
  gameState = {
    ...gameState,
    ...newGameStates,
  };
};
