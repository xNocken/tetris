import $ from 'jquery';
import '@babel/polyfill';

import { startGame } from './js/logic';

import './scss/main.scss';

$(() => {
  startGame();
});
