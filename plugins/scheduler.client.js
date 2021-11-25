// Import Vue
import Vue from 'vue';

// Import VueScheduler
import VueScheduler from './library/v-calendar-scheduler';

// Import styles
import 'v-calendar-scheduler/lib/main.css';
import './library/moment/locale/zh-tw';

Vue.use(VueScheduler, { locale: 'zh-tw' });
