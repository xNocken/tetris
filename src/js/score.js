import $ from 'jquery';
import { setGameState, getConfig, getGameState } from '../config';
import { flipFields } from './renderer';

const updateScore = () => {
  const score = getGameState('score') || 0;
  const clearedRows = (getGameState('clearedRows') || 0);
  const level = getGameState('level') || 0;

  $('#score').text(`Level: ${level}, Score: ${score}, Cleared lines: ${clearedRows + (level * 10)}`);
};

export const calculateScore = (lineAmount) => {
  let score = getGameState('score') || 0;
  let oneLine = getGameState('oneLine') || 0;
  let twoLines = getGameState('twoLines') || 0;
  let threeLines = getGameState('threeLines') || 0;
  let tetris = getGameState('tetris') || 0;
  let clearedRows = (getGameState('clearedRows') || 0) + lineAmount;
  let speed = getGameState('currentSpeed') || getConfig('initialInterval');
  let level = getGameState('level') || 0;
  const scores = getConfig('scores') || 0;

  switch (lineAmount) {
    case (1):
      oneLine += 1;
      break;

    case (2):
      twoLines += 1;
      break;

    case (3):
      threeLines += 1;
      break;

    case (4):
      tetris += 1;
      break;

    default:
      break;
  }

  while (clearedRows >= getConfig('linesBeforeLevelup')) {
    level += 1;
    clearedRows -= getConfig('linesBeforeLevelup');

    if (level % getConfig('levelsBeforeFlip') === 0) {
      if (getConfig('rotatingField')) {
        setGameState({ flipFields: true });
      }
    }

    speed -= getConfig('timeDecrementPerLevel');

    if (speed < getConfig('minSpeed')) {
      speed = getConfig('minSpeed');
    }
  }

  score += scores[lineAmount]
    !== undefined ? scores[lineAmount] : scores[scores.length - 1] * (level + 1);
  setGameState({
    score,
    clearedRows,
    level,
    oneLine,
    twoLines,
    threeLines,
    tetris,
    currentSpeed: speed,
  });
  updateScore();
};

export const softDrop = () => {
  let score = getGameState('score') || 0;
  score += 1;
  setGameState({ score });
  updateScore();
};

export const hardDrop = (rows) => {
  let score = getGameState('score') || 0;
  score += rows * 2;
  setGameState({ score });
  updateScore();
};
