import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
import feathersClient from '../feathers-client';

const { service, auth, FeathersVuex } = feathersVuex(feathersClient, { idField: '_id' });

Vue.use(Vuex);
Vue.use(FeathersVuex);

export default new Vuex.Store({
    plugins: [
        service('users', {
            actions: {
                clearCurrent({ commit }) {
                    commit('clearCurrent');
                },
            },
        }),

        service('classes'),
        service('groups'),
        service('constructions'),
        service('workshops', {
            idField: 'id',
        }),

        auth({
            userService: 'users',
            getters: {
                isAuthenticatePending(state) {
                    return () => state.isAuthenticatePending;
                },
            },
        }),
    ],
});
