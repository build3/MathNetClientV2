import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
import feathersClient from '../feathers-client';

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, { idField: '_id' });

Vue.use(Vuex);
Vue.use(FeathersVuex);

export default new Vuex.Store({
    plugins: [
        service('users'),

        auth({ userService: 'users' }),
    ],
    state: {
        token: localStorage.getItem('accessToken') || null,
    },
    mutations: {
        retriveToken(state, token) {
            state.token = token;
        },
        destroyToken(state) {
            state.token = null;
        },
    },
    actions: {
        retriveToken(context, token) {
            context.commit('retriveToken', token);
        },

        destroyToken(context) {
            context.commit('destroyToken');
        },
    },
});
