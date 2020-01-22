import $ from 'jquery';
import { setGameState, getConfig, getGameState } from '../config';

export const calculateScore = (lineAmount) => {
  let score = getGameState('score') || 0;
  let clearedRows = (getGameState('clearedRows') || 0) + lineAmount;
  let level = getGameState('level') || 0;
  const scores = getConfig('scores') || 0;

  while (clearedRows >= 10) {
    level += 1;
    clearedRows -= 10;

    let speed = getGameState('currentSpeed') || getConfig('initialInterval');
    speed -= getConfig('timeDecrementPerLevel');

    if (speed < getConfig('minSpeed')) {
      speed = getConfig('minSpeed');
    }

    setGameState({ currentSpeed: speed });
  }

  score += scores[lineAmount]
    !== undefined ? scores[lineAmount] : scores[scores.length - 1] * (level + 1);
  $('#score').text(`Level: ${level}, Score: ${score}, Cleared lines: ${clearedRows + (level * 10)}`);
  setGameState({ score, clearedRows, level });
};

export const softDrop = () => {
  let score = getGameState('score') || 0;
  score += 1;
  setGameState({ score });
};

export const hardDrop = (rows) => {
  let score = getGameState('score') || 0;
  score += rows * 2;
  setGameState({ score });
};
