import $ from 'jquery';

import { generateField } from './generate';
import { getConfig } from '../config';

// eslint-disable-next-line
export const startGame = () => {
  generateField(getConfig('fieldLength'));

  $(document).on('keydown', (event) => { console.log(event.which); $(document).on('keydown', () => { console.log(event.which); }) });
};
