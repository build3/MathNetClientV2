import Vue from 'vue';

import App from './App.vue';
import PageHeader from './components/Layout/PageHeader.vue';
import SideMenu from './components/Layout/SideMenu.vue';
import router from './router';
import store from './store';

require('./assets/app.scss');

Vue.component('side-menu', SideMenu);
Vue.component('page-header', PageHeader);

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
