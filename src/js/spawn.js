import $ from 'jquery';

import { setGameState, getConfig, getGameState } from '../config';
import { updateLines, blinkLines, endGame } from './renderer';
import { calculateScore } from './score';
import { generateBlock } from './generate';

export const checkLineRemove = () => {
  const fieldsUsed = getGameState('fieldsUsed');
  const $fields = getGameState('$fields');
  let removedAmount = 0;

  fieldsUsed.forEach((row, rowIndex) => {
    let remove = true;
    row.forEach((field) => {
      if (field === false) {
        remove = false;
      }
    });

    if (remove) {
      blinkLines($fields, rowIndex);
      removedAmount += 1;
    }
  });

  calculateScore(removedAmount);
  setGameState({ fieldsUsed });

  return removedAmount;
};

const spawnNewBlock = (fieldsUsed) => {
  const previews = getGameState('previews') || Array.from({ length: getConfig('previewCount') }, () => generateBlock());
  const fieldPos = $('#fields')[0].getBoundingClientRect();
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
    getGameState('activeBlock').remove();
  }

  setGameState({ isAppended: true, gameOver });
};

export const getNewBlock = (dontSafe) => {
  const activeBlock = getGameState('activeBlock');
  const fieldsUsed = getGameState('fieldsUsed');
  const placedBlocks = getGameState('placedBlocks');
  const fieldPos = $('#fields')[0].getBoundingClientRect();
  const colors = getConfig('colors');
  let removed = 0;

  if (activeBlock) {
    if (!dontSafe) {
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
        updateLines(fieldsUsed);
      }, getConfig('blockDestroyblinkDelay') * 6);

      updateLines(fieldsUsed);
    }

    activeBlock.remove();
    setGameState({ isAppended: false });
    setGameState({ placedBlocks, fieldsUsed });
  }

  setTimeout(() => {
    spawnNewBlock(fieldsUsed);
  }, removed ? getConfig('blockDestroyblinkDelay') * 6 : 0);
};
