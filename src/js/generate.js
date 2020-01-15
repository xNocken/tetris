import $ from 'jquery';
import { getBlock, getConfig, getBlockNames } from '../config';

export const generateField = (length) => {
  const $div = $('#fields');

  const $fields = Array.from({ length }, () => Array.from({ length }, () => {
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
};

export const generateBlock = () => {
  const blocks = getBlockNames('blocks');
  const blockName = blocks[Math.floor(Math.random() * blocks.length)];
  const model = getBlock(blockName);
  const color = getConfig('colors')[Math.floor(Math.random() * 3)];
  const wrapper = $('<div class="block"></div>');

  model.forEach((row) => {
    const $row = $('<div class="row"></div>');

    wrapper.append($row);
    row.forEach((block) => {
      const $block = $('<div class="field"></div>');

      if (!block) {
        $block.addClass('field--invisible');
      } else {
        $block.addClass(`field--${color}`);
      }
      $row.append($block);
    });
  });

  return wrapper;
};
