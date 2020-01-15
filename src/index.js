import $ from 'jquery';
import { generateField, generateBlock } from './js/generate';

import './scss/main.scss';

$(() => {
  generateField(10);
  $('#fields').append(generateBlock('lRight'));
});
