import $ from 'jquery';
import {
  getBlock,
  getConfig,
  getBlockNames,
  setGameState,
} from '../config';

export const generateField = (length) => {
  const $div = $('#fields');
  const fieldsUsed = Array.from({ length: length * getConfig('longnessMultiplier') }, () => Array.from({ length }, () => false));
  const placedBlocks = Array.from({ length: length * getConfig('longnessMultiplier') }, () => Array.from({ length }, () => false));

  setGameState({ fieldsUsed, placedBlocks });

  const $fields = Array.from({ length: length * getConfig('longnessMultiplier') }, () => Array.from({ length }, () => {
    const $field = $('<div class="field"></div>');
    return $field;
  }));

  $div.empty();
  $fields.forEach((row) => {
    const $row = $('<div class="row"></div>');
    $div.append($row);

    row.forEach(($item) => {
      $row.append($item);
    });
  });

  setGameState({ $fields });
};

export const generateBlock = () => {
  const blocks = getBlockNames('blocks');
  const blockName = blocks[Math.floor(Math.random() * blocks.length)];
  const model = getBlock(blockName);
  const colors = getConfig('colors');
  const color = colors[Math.floor(Math.random() * colors.length)];
  const wrapper = $('<div class="block"></div>');

  model.forEach((row) => {
    const $row = $('<div class="row"></div>');

    wrapper.append($row);
    row.forEach((block) => {
      const $block = $('<div class="field"></div>');

      $block.addClass(`field--${block ? color : 'invisible'}`);

      if (!block) {
        $block.data('invisible', true);
      }

      $row.append($block);
    });
  });

  return wrapper;
};
