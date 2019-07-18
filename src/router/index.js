import Vue from 'vue';
import Router from 'vue-router';

import Pages from '@/components/Pages';

Vue.use(Router);

export default new Router({
    routes: [
        { path: '', name: 'Home', component: Pages.Home },

        { path: '/register', name: 'Register', component: Pages.Users.Register },
        { path: '/login', name: 'Login', component: Pages.Users.Login },
        { path: '/admin', name: 'Admin', component: Pages.Users.Admin },

        {
            path: '/classes',
            name: 'ClassesHome',
            component: Pages.Classes.Home,
            children: [
                {
                    path: 'list',
                    name: 'ClassesList',
                    component: Pages.Classes.List,
                },
                {
                    path: ':code',
                    name: 'ClassDetails',
                    component: Pages.Classes.Details,
                    props: true,
                },
            ],
        },
    ],
});
