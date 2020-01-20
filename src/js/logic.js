import $ from 'jquery';

import { generateField, generateBlock } from './generate';
import { getConfig, getGameState, setGameState } from '../config';

const scoringSystem = (lineAmount) => {
  let score = getGameState('score') || 0;
  let clearedRows = (getGameState('clearedRows') || 0) + lineAmount;
  let level = getGameState('level') || 0;
  const scores = getConfig('scores') || 0;

  while (clearedRows >= 10) {
    level += 1;
    clearedRows -= 10;
  }

  score += scores[lineAmount]
    !== undefined ? scores[lineAmount] : scores[scores.length - 1] * (level + 1);
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
      }, getConfig('blockDestroyblinkDelay'));

      setTimeout(() => {
        fieldsUsed.splice(rowIndex, 1);
        fieldsUsed.unshift(Array.from({ length: getConfig('fieldLength') }, () => false));
      }, getConfig('blockDestroyblinkDelay') * 6);

      removedAmount += 1;
    }
  });

  scoringSystem(removedAmount);
  setGameState({ fieldsUsed });

  return removedAmount;
};

const endGame = () => {
  $(document).unbind('keydown');
};

const getNewBlock = () => {
  const activeBlock = getGameState('activeBlock');
  const fieldsUsed = getGameState('fieldsUsed');
  const placedBlocks = getGameState('placedBlocks');
  const fieldPos = $('#fields')[0].getBoundingClientRect();
  const $fields = getGameState('$fields');
  const colors = getConfig('colors');
  let removed = 0;

  if (activeBlock) {
    const blocks = activeBlock.children();
    blocks.each((__, item) => {
      $(item).children().each((___, field) => {
        if (!$(field).data('invisible')) {
          const position = {
            fieldIndex: (field.getBoundingClientRect().left - fieldPos.left) / getConfig('moveHeight'),
            rowIndex: (field.getBoundingClientRect().top - fieldPos.top) / getConfig('moveHeight'),
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

    removed = checkLineRemove();
    setTimeout(() => {
      fieldsUsed.forEach((row, rowIndex) => {
        row.forEach((field, fieldIndex) => {
          if (field !== false) {
            $fields[rowIndex][fieldIndex][0].classList = `field field--${colors[field]}`;
          } else {
            $fields[rowIndex][fieldIndex][0].classList = 'field';
          }
        });
      });
    }, getConfig('blockDestroyblinkDelay') * 6);

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
    setGameState({ isAppended: false });
    setGameState({ placedBlocks, fieldsUsed });
  }

  setTimeout(() => {
    const previews = getGameState('previews') || Array.from({ length: getConfig('previewCount') }, () => generateBlock());

    const newBlock = previews.shift();
    previews.push(generateBlock());
    setGameState({ activeBlock: newBlock, previews });

    previews.forEach((preview) => {
      $('#preview').append(preview);
    });

    $('#fields').append(newBlock);
    const blocks = newBlock.children();
    let gameOver = false;

    blocks.each((index, rows) => {
      $(rows).children().each((index2, field) => {
        const position = {
          fieldIndex: (field.getBoundingClientRect().left - fieldPos.left) / getConfig('moveHeight'),
          rowIndex: (field.getBoundingClientRect().top - fieldPos.top) / getConfig('moveHeight'),
        };

        if (fieldsUsed[position.rowIndex][position.fieldIndex] !== false) {
          gameOver = true;
        }
      });
    });

    if (gameOver) {
      endGame();
    }

    setGameState({ isAppended: true, gameOver });
  }, removed ? getConfig('blockDestroyblinkDelay') * 6 : 0);
};

const rotateBlock = () => {
  const $activeBlock = getGameState('activeBlock');
  const rotation = $activeBlock.data('rotation') || 0;
  const blocks = $activeBlock.children();
  const moveHeight = getConfig('moveHeight');
  const fieldPos = $('#fields')[0].getBoundingClientRect();
  const fieldsUsed = getGameState('fieldsUsed');
  let invalid = false;
  const direction = { rowIndex: 0, fieldIndex: 0 };

  $activeBlock[0].style.transform = `rotate(${rotation + 90}deg)`;

  let newPos = $activeBlock[0].getBoundingClientRect();
  let rotated = getGameState('rotated');
  if (rotated === undefined) {
    rotated = false;
  }

  if ((newPos.left - fieldPos.left) % moveHeight !== 0) {
    if (rotated) {
      $activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
    } else {
      $activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
    }
  }


  blocks.each((_, item) => {
    $(item).children().each((__, field) => {
      if (!$(field).data('invisible')) {
        const position = {
          fieldIndex: (field.getBoundingClientRect().left - fieldPos.left) / getConfig('moveHeight'),
          rowIndex: (field.getBoundingClientRect().top - fieldPos.top) / getConfig('moveHeight'),
        };

        const { rowIndex, fieldIndex } = position;

        if (rowIndex < 0) {
          invalid = true;
          direction.rowIndex += 1;
        } else if (rowIndex >= fieldsUsed.length) {
          invalid = true;
          direction.rowIndex += -1;
        } else if (fieldIndex < 0) {
          invalid = true;
          direction.fieldIndex += 1;
        } else if (fieldIndex >= fieldsUsed[rowIndex].length) {
          invalid = true;
          direction.fieldIndex += -1;
        } else if (fieldsUsed[rowIndex] === undefined
          || fieldsUsed[rowIndex][fieldIndex] !== false) {
          invalid = true;
        }
      }
    });
  });

  if (invalid) {
    $activeBlock.css({ top: `+=${direction.rowIndex * moveHeight}`, left: `+=${direction.fieldIndex * moveHeight}` });

    if (direction.rowIndex === 0 && direction.fieldIndex === 0) {
      $activeBlock[0].style.transform = `rotate(${rotation}deg)`;
    }

    newPos = $activeBlock[0].getBoundingClientRect();
    if ((newPos.left - fieldPos.left) % moveHeight !== 0) {
      if (!rotated) {
        $activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
      } else {
        $activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
      }
    }
  }

  if ((direction.rowIndex !== 0 || direction.fieldIndex !== 0) || invalid === false) {
    setGameState({ rotated: !rotated });
    $activeBlock.data('rotation', rotation + 90);
  }
};

const click = (event) => {
  let prevent = false;
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
  const fieldPos = $('#fields')[0].getBoundingClientRect();

  blocks.each((index, item) => {
    $(item).children().each((index2, field) => {
      if (!$(field).data('invisible')) {
        const position = {
          fieldIndex: (field.getBoundingClientRect().left - fieldPos.left) / getConfig('moveHeight'),
          rowIndex: (field.getBoundingClientRect().top - fieldPos.top) / getConfig('moveHeight'),
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
    $activeBlock[0].focus();
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

  const intervall = setInterval(() => {
    const gameOver = getGameState('gameOver');
    if (gameOver) {
      clearInterval(intervall);
    }
    click({ which: getConfig('keyBinds').down });
  }, 1000);
};
