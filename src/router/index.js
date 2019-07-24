import Vue from 'vue';
import Router from 'vue-router';

import Pages from '@/components/Pages';

Vue.use(Router);

export default new Router({
    routes: [
        { path: '/admin', name: 'Admin', component: Pages.Admin.Admin },
        { path: '/designer', name: 'Designer', component: Pages.Admin.Designer },
        { path: '/view', name: 'View', component: Pages.Admin.View },

        {
            path: '/users',
            name: 'UsersHome',
            component: Pages.Users.Home,
            children: [
                {
                    path: 'register',
                    name: 'Register',
                    component: Pages.Users.Register,
                },
                {
                    path: 'login',
                    name: 'Login',
                    component: Pages.Users.Login,
                    props: true,
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: Pages.Users.Profile,
                    props: true,
                },
            ],
        },

        {
            path: '/classes',
            name: 'ClassesHome',
            component: Pages.Classes.Home,
            children: [
                {
                    path: 'list',
                    name: 'ClassList',
                    component: Pages.Classes.List,
                },
                {
                    path: ':id',
                    name: 'ClassDetails',
                    component: Pages.Classes.Details,
                    props: true,
                },
            ],
        },

        {
            path: '/student',
            name: 'StudentHome',
            component: Pages.Student.Home,
            children: [
                {
                    path: 'class',
                    name: 'StudentClass',
                    component: Pages.Student.Class,
                },
                {
                    path: 'geogebra/:id',
                    name: 'StudentGeogebra',
                    component: Pages.Student.Geogebra,
                    props: true,
                },
                {
                    path: ':id',
                    name: 'StudentGroup',
                    component: Pages.Student.Group,
                    props: true,
                },
            ],
        },
    ],
});
