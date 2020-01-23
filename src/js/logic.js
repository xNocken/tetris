import $ from 'jquery';

import { generateField } from './generate';
import { getConfig, getGameState, setGameState } from '../config';
import { updatePosition, rotateBlock } from './renderer';
import { getNewBlock } from './spawn';
import { softDrop, hardDrop } from './score';

const click = (event) => {
  let prevent = false;
  let count = 0;
  const keyBinds = getConfig('keyBinds');
  Object.values(keyBinds).forEach((key) => {
    if (key === event.which) {
      prevent = true;
    }
  });

  if (event.preventDefault && prevent) {
    event.preventDefault();
  }

  if (!getGameState('isAppended')) {
    return;
  }

  const direction = { fieldIndex: 0, rowIndex: 0 };

  switch (event.which) {
    case (keyBinds.down):
      direction.rowIndex = 1;
      if (event.preventDefault) {
        softDrop();
      }
      break;

    case (keyBinds.right):
      direction.fieldIndex = 1;
      break;

    case (keyBinds.left):
      direction.fieldIndex = -1;
      break;

    case (keyBinds.up):
      rotateBlock();
      return;

    case (keyBinds.num0):
      getNewBlock(true);
      return;

    case (keyBinds.space):
      setGameState({ hardDropComplete: false });

      while (!getGameState('hardDropComplete')) {
        click({ which: keyBinds.down });
        count += 1;
      }

      hardDrop(count);
      return;

    default:
      return;
  }

  const invalid = updatePosition(direction);

  if (invalid && event.which === keyBinds.down) {
    setGameState({ hardDropComplete: true });
    getNewBlock();
  }
};

const changeFallSpeed = () => {
  const newSpeed = getGameState('currentSpeed') || getConfig('initialInterval');

  const interval = setInterval(() => {
    if (getGameState('currentSpeed') !== newSpeed) {
      clearInterval(getGameState('interval'));
      changeFallSpeed();
    }
    const gameOver = getGameState('gameOver');
    if (gameOver) {
      clearInterval(interval);
      return;
    }

    click({ which: getConfig('keyBinds').down });
  }, newSpeed);

  setGameState({ interval });
};

// eslint-disable-next-line import/prefer-default-export
export const startGame = () => {
  generateField(getConfig('fieldLength'));
  getNewBlock();

  $(document).on('keydown', (event) => { click(event); });

  changeFallSpeed();
};
