import $ from 'jquery';
import {
  getConfig,
  getGameState,
  setGameState,
  getEndscreen,
} from '../config';

export const endGame = () => {
  $(document).unbind('keydown');

  const endGameField = $('#endgame');
  const wrapper = $('<div id="endgame--wrapper"></div>');
  const endScreenvars = getEndscreen();

  endScreenvars.forEach((endScreen) => {
    wrapper.append(`<p>${endScreen.name}: ${endScreen.value}</p>`);
  });

  endGameField.empty();
  endGameField.append(wrapper);
  endGameField.show();
};

export const updateLines = (fieldsUsed) => {
  const colors = getConfig('colors');
  const $fields = getGameState('$fields');

  fieldsUsed.forEach((row, rowIndex) => {
    row.forEach((field, fieldIndex) => {
      if (field !== false) {
        $fields[rowIndex][fieldIndex][0].classList = `field field--${colors[field]}`;
      } else {
        $fields[rowIndex][fieldIndex][0].classList = 'field';
      }
    });
  });
};

export const flipFields = () => {
  const fieldsUsed = getGameState('fieldsUsed');
  const newFields = fieldsUsed.reverse();
  const emptyLines = [];

  newFields.forEach((item, index) => {
    let isEmpty = true;

    item.forEach((field) => {
      if (field !== false) {
        isEmpty = false;
      }
    });

    if (isEmpty) {
      emptyLines.push(index);
    }
  });

  emptyLines.forEach((row) => {
    newFields.splice(row, 1);
    newFields.unshift(Array.from({ length: getConfig('fieldLength') }, () => false));
  });

  setGameState({ fieldsUsed: newFields });
};

export const blinkLines = ($fields, rowsToRemove) => {
  const fieldsUsed = getGameState('fieldsUsed');
  const colors = getConfig('colors');
  const counter = [];

  const intervall = setInterval(() => {
    rowsToRemove.forEach((rowIndex) => {
      $fields[rowIndex].forEach(($field, index) => {
        $field.toggleClass(`field--${colors[fieldsUsed[rowIndex][index]]}--transparent`);
      });

      counter[rowIndex] = counter[rowIndex] ? counter[rowIndex] + 1 : 1;
      if (counter[rowIndex] === 5) {
        clearInterval(intervall);
        fieldsUsed.splice(rowIndex, 1);
        fieldsUsed.unshift(Array.from({ length: getConfig('fieldLength') }, () => false));
      }
    });

    if (counter[rowsToRemove[0]] === 5) {
      if (getGameState('flipFields')) {
        flipFields();
        setGameState({ flipFields: false });
      }
    }
  }, getConfig('blockDestroyblinkDelay'));

  return rowsToRemove.length || 0;
};

export const updatePosition = (direction) => {
  const $activeBlock = getGameState('activeBlock');
  const blocks = $activeBlock.children();
  let invalid = false;
  const blockPositions = [];
  const fieldPos = $('#fields')[0].getBoundingClientRect();

  blocks.each((index, item) => {
    $(item).children().each((index2, field) => {
      if (!$(field).data('invisible')) {
        const position = {
          fieldIndex: (Math.round(field.getBoundingClientRect().left - fieldPos.left)) / getConfig('moveHeight'),
          rowIndex: (Math.round(field.getBoundingClientRect().top - fieldPos.top)) / getConfig('moveHeight'),
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

  return invalid;
};

export const rotateBlock = () => {
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

  if ((Math.round(newPos.left - fieldPos.left) % moveHeight !== 0)) {
    if (rotated) {
      $activeBlock.css({ top: `-=${moveHeight / 2}`, left: `-=${moveHeight / 2}` });
    } else {
      $activeBlock.css({ top: `+=${moveHeight / 2}`, left: `+=${moveHeight / 2}` });
    }
  }


  blocks.each((_, item) => {
    $(item).children().each((__, field) => {
      if (!$(field).data('invisible')) {
        const fieldIndex = (Math.round(field.getBoundingClientRect().left - fieldPos.left)) / getConfig('moveHeight');
        const rowIndex = (Math.round(field.getBoundingClientRect().top - fieldPos.top)) / getConfig('moveHeight');

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
