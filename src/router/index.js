import Vue from 'vue';
import Router from 'vue-router';

import Pages from '@/components/Pages';

Vue.use(Router);

export default new Router({
    routes: [
        { path: '', name: 'Home', component: Pages.Home },

        { path: '/admin', name: 'Admin', component: Pages.Admin.Admin },
        { path: '/designer', name: 'Designer', component: Pages.Admin.Designer },
        { path: '/view', name: 'View', component: Pages.Admin.View },

        { path: '/student-class', name: 'Student-Class', component: Pages.Student.StudentClass },
        { path: '/student-group', name: 'Student-Group', component: Pages.Student.StudentGroup },
        { path: '/student-geogebra', name: 'Student-Geogebra', component: Pages.Student.StudentGeogebra },

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
                    path: ':code',
                    name: 'ClassDetails',
                    component: Pages.Classes.Details,
                    props: true,
                },
            ],
        },
    ],
});
