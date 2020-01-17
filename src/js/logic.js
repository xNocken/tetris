import $ from 'jquery';

import { generateField, generateBlock } from './generate';
import { getConfig, getGameState, setGameState } from '../config';

const scoringSystem = (lineAmount) => {
  let score = getGameState('score') || 0;
  let clearedRows = (getGameState('clearedRows') || 0) + lineAmount;
  let level = getGameState('level') || 0;
  const scores = getConfig('scores') || 0;

  if (clearedRows >= 10) {
    level += 1;
    clearedRows -= 10;
  }

  score += scores[lineAmount] * (level + 1);
  $('#score').text(`Level: ${level}, Score: ${score}, Cleared lines: ${clearedRows + (level * 10)}`);
  setGameState({ score, clearedRows, level });
};

const checkLineRemove = () => {
  const fieldsUsed = getGameState('fieldsUsed');
  const $fields = getGameState('$fields');
  let removedAmount = 0;
  const colors = getConfig('colors');

  fieldsUsed.forEach((row, rowIndex) => {
    let remove = true;
    row.forEach((field) => {
      if (field === false) {
        remove = false;
      }
    });

    if (remove) {
      let counter = 0;
      const intervall = setInterval(() => {
        $fields[rowIndex].forEach(($field, index) => {
          $field.toggleClass(`field--${colors[fieldsUsed[rowIndex][index]]}--transparent`);
        });

        counter += 1;
        if (counter === 5) {
          clearInterval(intervall);
        }
      }, 150);

      fieldsUsed.splice(rowIndex, 1);
      fieldsUsed.unshift(Array.from({ length: getConfig('fieldLength') }, () => false));
      removedAmount += 1;
    }
  });

  scoringSystem(removedAmount);
  setGameState({ fieldsUsed });
};

const getNewBlock = () => {
  const activeBlock = getGameState('activeBlock');
  const fieldsUsed = getGameState('fieldsUsed');
  const placedBlocks = getGameState('placedBlocks');
  const $fields = getGameState('$fields');
  const colors = getConfig('colors');

  if (activeBlock) {
    const blocks = activeBlock.children();
    blocks.each((__, item) => {
      $(item).children().each((___, field) => {
        if (!$(field).data('invisible')) {
          const position = {
            fieldIndex: (field.getBoundingClientRect().left - getConfig('bodyMargin')) / getConfig('moveHeight'),
            rowIndex: (field.getBoundingClientRect().top - getConfig('bodyMargin')) / getConfig('moveHeight'),
          };

          colors.forEach((color, index) => {
            if (field.classList.contains(`field--${color}`)) {
              fieldsUsed[position.rowIndex][position.fieldIndex] = index;
            }
          });

          placedBlocks[position.rowIndex][position.fieldIndex] = $(field);
        }
      });
    });

    checkLineRemove();
    fieldsUsed.forEach((row, rowIndex) => {
      row.forEach((field, fieldIndex) => {
        if (field !== false) {
          $fields[rowIndex][fieldIndex][0].classList = `field field--${colors[field]}`;
        } else {
          $fields[rowIndex][fieldIndex][0].classList = 'field';
        }
      });
    });

    activeBlock.remove();
    setGameState({ placedBlocks, fieldsUsed });
  }

  const newBlock = getGameState('nextBlock') || generateBlock();
  const nextBlock = generateBlock();
  setGameState({ activeBlock: newBlock, newBlock, nextBlock });
  $('#preview').append(nextBlock);
  $('#fields').append(newBlock);
};

const rotateBlock = () => {
  const $activeBlock = getGameState('activeBlock');
  const rotation = $activeBlock.data('rotation') || 0;
  const blocks = $activeBlock.children();
  const moveHeight = getConfig('moveHeight');
  const bodyMargin = getConfig('bodyMargin');
  const fieldsUsed = getGameState('fieldsUsed');

  $activeBlock[0].style.transform = `rotate(${rotation + 90}deg)`;

  const newPos = $activeBlock[0].getBoundingClientRect();
  let rotated = getGameState('rotated');
  if (rotated === undefined) {
    rotated = false;
  }

  if ((newPos.left - bodyMargin) % moveHeight !== 0) {
    if (rotated) {
      $activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
    } else {
      $activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
    }
  }

  let invalid = false;

  blocks.each((index, item) => {
    $(item).children().each((index2, field) => {
      if (!$(field).data('invisible')) {
        const position = {
          fieldIndex: (field.getBoundingClientRect().left - getConfig('bodyMargin')) / getConfig('moveHeight'),
          rowIndex: (field.getBoundingClientRect().top - getConfig('bodyMargin')) / getConfig('moveHeight'),
        };

        const { rowIndex, fieldIndex } = position;

        if (fieldsUsed[rowIndex] === undefined || fieldsUsed[rowIndex][fieldIndex] !== false) {
          invalid = true;
        }
      }
    });
  });

  if (invalid) {
    $activeBlock[0].style.transform = `rotate(${rotation}deg)`;
    setGameState({ rotated: !rotated });

    if ((newPos.left - bodyMargin) % moveHeight !== 0) {
      if (!rotated) {
        $activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
      } else {
        $activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
      }
    }
  } else {
    $activeBlock.data('rotation', rotation + 90);
  }
};

const click = (event) => {
  const direction = { fieldIndex: 0, rowIndex: 0 };
  const keyBinds = getConfig('keyBinds');

  switch (event.which) {
    case (keyBinds.down):
      direction.rowIndex = 1;
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

    default:
      return;
  }

  const $activeBlock = getGameState('activeBlock');
  const blocks = $activeBlock.children();
  let invalid = false;
  const blockPositions = [];

  blocks.each((index, item) => {
    $(item).children().each((index2, field) => {
      if (!$(field).data('invisible')) {
        const position = {
          fieldIndex: (field.getBoundingClientRect().left - getConfig('bodyMargin')) / getConfig('moveHeight'),
          rowIndex: (field.getBoundingClientRect().top - getConfig('bodyMargin')) / getConfig('moveHeight'),
        };

        blockPositions.push(position);

        const fieldUsed = getGameState('fieldsUsed');
        const fieldIndex = position.fieldIndex + direction.fieldIndex;
        const rowIndex = position.rowIndex + direction.rowIndex;

        if (fieldUsed[rowIndex] === undefined || fieldUsed[rowIndex][fieldIndex] !== false) {
          invalid = true;
        }
      }
    });
  });

  setGameState({ blockPositions });
  const moveHeight = getConfig('moveHeight');
  const oldPos = $activeBlock[0].style;
  const newPosLeft = (direction.fieldIndex * moveHeight) + (parseInt(oldPos.left, 10) || 0);
  const newPosTop = (direction.rowIndex * moveHeight) + (parseInt(oldPos.top, 10) || 0);

  if (!invalid) {
    $activeBlock.css({ left: newPosLeft, top: newPosTop });
  }

  if (invalid && event.which === keyBinds.down) {
    getNewBlock();
  }
};

// eslint-disable-next-line import/prefer-default-export
export const startGame = () => {
  generateField(getConfig('fieldLength'));

  getNewBlock();

  $(document).on('keydown', (event) => { click(event); });

  setInterval(() => {
    click({ which: getConfig('keyBinds').down });
  }, 1000);
};
