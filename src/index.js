import $ from 'jquery';

import './js/generate';
import './config';

import './scss/main.scss';
import { startGame } from './js/logic';

$(() => {
  startGame();
});
