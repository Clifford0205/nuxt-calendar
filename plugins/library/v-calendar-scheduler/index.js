/**
 * Created by David on 23-Apr-18.
 */

import moment from 'moment';
import config, { setOptions } from './utils/config';
import VueScheduler from './components/VueScheduler';

export default {
  install: (Vue, options = {}) => {
    setOptions(Object.assign(config, options));
    moment.locale(config.locale);

    Vue.component('VueScheduler', VueScheduler);
  },
};
