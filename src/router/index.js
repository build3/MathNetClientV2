import Vue from 'vue';
import Router from 'vue-router';

import Pages from '@/components/Pages';
import store from '../store';


Vue.use(Router);

function proceed(permission, next) {
    if (store.state.auth.user.permissions.includes(permission)) {
        next();
    } else {
        next('/404');
    }
}

function permissionCheck(permission, next) {
    if (store.state.auth.user) {
        proceed(permission, next);
    } else {
        store.watch(store.getters['auth/isAuthenticatePending'], () => {
            proceed(permission, next);
        });
    }
}

function requireAuthAdmin(to, from, next) {
    permissionCheck('admin', next);
}

function requireAuthStudent(to, from, next) {
    permissionCheck('student', next);
}

export default new Router({
    routes: [
        {
            path: '/designer',
            name: 'Designer',
            component: Pages.Admin.Designer,
            beforeEnter: requireAuthAdmin,
            meta: {
                permissions: 'admin',
            },
        },
        {
            path: '/view',
            name: 'View',
            component: Pages.Admin.View,
            beforeEnter: requireAuthAdmin,
            meta: {
                permissions: 'admin',
            },
        },
        { path: '/404', name: 'NotFound', component: Pages.Admin.NotFound },
        { path: '*', redirect: '/404' },

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
            beforeEnter: requireAuthAdmin,
            meta: {
                permissions: 'admin',
            },
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
                { path: '/404', name: 'NotFound', component: Pages.NotFound },
                { path: '*', redirect: '/404' },
            ],
        },

        {
            path: '/student',
            name: 'StudentHome',
            component: Pages.Student.Home,
            beforeEnter: requireAuthStudent,
            meta: {
                permissions: 'student',
            },
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
                    path: ':code',
                    name: 'StudentGroup',
                    component: Pages.Student.Group,
                    props: true,
                },
                { path: '/404', name: 'NotFound', component: Pages.NotFound },
                { path: '*', redirect: '/404' },
            ],
        },
    ],
});
