import Vue from 'vue';
import VueLogger from 'vuejs-logger';

import App from './App.vue';
import PageHeader from './components/Layout/PageHeader.vue';
import SideMenu from './components/Layout/SideMenu.vue';
import router from './router';
import store from './store';
import IdleVue from 'idle-vue'

require('./assets/app.scss');

Vue.component('side-menu', SideMenu);
Vue.component('page-header', PageHeader);

const isProduction = process.env.NODE_ENV === 'production';

const options = {
    isEnabled: true,
    logLevel: isProduction ? 'error' : 'debug',
    stringifyArguments: false,
    showLogLevel: true,
    showMethodName: true,
    separator: '-',
    showConsoleColors: true,
};

const IDLE_TIME = 1200000;

Vue.use(VueLogger, options);

const eventsHub = new Vue();

Vue.use(IdleVue, {
    eventEmitter: eventsHub,
    idleTime: IDLE_TIME,
    stop: true
});

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
