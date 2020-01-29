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
        if (value.indexOf('px') > -1) {
          lastobject[name] = parseInt(value, 10);
        } else {
          lastobject[name] = value;
        }
      } else {
        if (!lastobject[name]) {
          lastobject[name] = {};
        }

        lastName = name;
      }
    } else if (index + 1 === names.length) {
      if (value.indexOf('px') > -1) {
        lastobject[lastName][name] = parseInt(value, 10);
      } else {
        lastobject[lastName][name] = value;
      }
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


const { colors, block } = variablesNew;
const { margin, border, height } = block;


const blocks = {
  stick: {
    color: 'aqua',
    structure: [
      [1, 1, 1, 1],
    ],
  },
  leftL: {
    color: 'blue',
    structure: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  rightL: {
    color: 'orange',
    structure: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  block: {
    color: 'yellow',
    structure: [
      [1, 1],
      [1, 1],
    ],
  },
  leftUhm: {
    color: 'green',
    structure: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  t: {
    color: 'rebeccapurple',
    structure: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  rightUhm: {
    color: 'red',
    structure: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
};

const config = {
  linesBeforeLevelup: 10,
  levelsBeforeFlip: 3,
  spawnNextBlockAfterHardDrop: true,
  rotatingField: true,
  blockDestroyblinkDelay: 150,
  colors: colors.split(', '),
  initialInterval: 1000,
  timeDecrementPerLevel: 90,
  minSpeed: 1000,
  previewCount: 5,
  scores: [
    0,
    50,
    150,
    350,
    1000,
  ],
  moveHeight: margin + (border * 2) + height,
  blockstyle: {
    height,
    border,
    margin,
  },
  longnessMultiplier: 2,
  fieldLength: 10,
  keyBinds: {
    left: 37,
    down: 40,
    right: 39,
    up: 38,
    num0: 96,
    space: 32,
  },
};

let gameState = {};

export const getConfig = key => config[key];
export const getBlock = blockName => blocks[blockName];
export const getGameState = key => (key ? gameState[key] : gameState);
export const getBlockNames = () => Object.keys(blocks);

export const getEndscreen = () => ([
  {
    name: 'Score',
    value: getGameState('score'),
  }, {
    name: 'Level',
    value: getGameState('level'),
  }, {
    name: 'Cleared lines',
    value: getGameState('clearedRows') + (getConfig('linesBeforeLevelup') * getGameState('level')),
  }, {
    name: 'Speed',
    value: `${getGameState('currentSpeed') || getConfig('initialInterval')}ms`,
  }, {
    name: '1 Line',
    value: getGameState('oneLine'),
  }, {
    name: '2 Lines',
    value: getGameState('twoLines'),
  }, {
    name: '3 Lines',
    value: getGameState('threeLines'),
  }, {
    name: 'Tetris',
    value: getGameState('tetris'),
  },
]);

export const setGameState = (newGameStates) => {
  gameState = {
    ...gameState,
    ...newGameStates,
  };
};

// TODO: remove this
global.getGameState = getGameState;
global.setGameState = setGameState;
