import $ from 'jquery';

import { generateField, generateBlock } from './generate';
import { getConfig, getGameState, setGameState } from '../config';

const checkLineRemove = () => {
  const fieldsUsed = getGameState('fieldsUsed');

  fieldsUsed.forEach((row, rowIndex) => {
    let remove = true;
    row.forEach((field) => {
      if (field === false) {
        remove = false;
      }
    });

    if (remove) {
      fieldsUsed.splice(rowIndex, 1);
      fieldsUsed.unshift(Array.from({ length: getConfig('fieldLength') }, () => false));
    }
  });

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
    });

    activeBlock.remove();
    setGameState({ placedBlocks, fieldsUsed });
  }

  const newBlock = generateBlock();
  setGameState({ activeBlock: newBlock });
  $('#fields').append(newBlock);
};

const rotateBlock = () => {
  const activeBlock = getGameState('activeBlock');
  const rotation = activeBlock.data('rotation') || 0;
  const moveHeight = getConfig('moveHeight');
  const bodyMargin = getConfig('bodyMargin');

  activeBlock[0].style.transform = `rotate(${rotation + 90}deg)`;

  const newPos = activeBlock[0].getBoundingClientRect();

  if ((newPos.left - bodyMargin) % moveHeight !== 0) {
    const offset = activeBlock.data('positionOffset');

    if (offset) {
      activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
      activeBlock.data('positionOffset', 0);
    } else {
      activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
      activeBlock.data('positionOffset', moveHeight / 2);
    }
  }
  activeBlock.data('rotation', rotation + 90);
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
  const oldPos = $activeBlock[0].getBoundingClientRect();
  const offset = $activeBlock.data('positionOffset') || 0;
  const newPosLeft = (direction.fieldIndex * moveHeight) + (oldPos.left - getConfig('bodyMargin') - offset);
  const newPosTop = (direction.rowIndex * moveHeight) + (oldPos.top - getConfig('bodyMargin') + offset);

  if (!invalid) {
    $activeBlock.css({ left: newPosLeft, top: newPosTop });
  }

  if (invalid && event.which === keyBinds.down) {
    getNewBlock();
  }
};

// eslint-disable-next-line
export const startGame = () => {
  generateField(getConfig('fieldLength'));

  getNewBlock();

  $(document).on('keydown', (event) => { click(event); });

  setInterval(() => {
    click({ which: getConfig('keyBinds').down });
  }, 1000);
};
