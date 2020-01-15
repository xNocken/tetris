import $ from 'jquery';

export default (length) => {
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
