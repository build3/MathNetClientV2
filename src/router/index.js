import Vue from 'vue';
import Router from 'vue-router';

import Pages from '@/components/Pages';
import store from '../store';


Vue.use(Router);

function destinationError(to, from, next) {
    if (store.state.auth.user) {
        next('/404');
    } else {
        next('/users/login');
    }
}

function proceed(permission, next) {
    if (store.state.auth.user.permissions.includes(permission)) {
        next();
    } else {
        next('/404');
    }
}

async function permissionCheck(permission, next) {
    /* Normal case - we're logged in, we just need to check permissions */
    if (store.state.auth.user) {
        if (permission === null) {
            next();
        } else {
            proceed(permission, next);
        }
    } else {
        /* We're not logged in, so we're either just after a refresh
         * or not logged in at all. So we set up a watcher first, then
         * ensure it'll have something to watch by calling
         * auth.authenticate */
        store.watch(store.getters['auth/isAuthenticatePending'], () => {
            if (!store.getters['auth/isAuthenticatePending']()) {
                /* We logged in with token */
                if (store.state.auth.user) {
                    if (permission === null) {
                        next();
                    } else {
                        proceed(permission, next);
                    }
                } else {
                    /* There's no token, we're actually logged out. */
                    next('Login');
                }
            }
        });

        try {
            await store.dispatch('auth/authenticate');
        } catch (error) {
            if (error.name !== 'NotAuthenticated') {
                console.log(error);
            }
        }
    }
}

function requireAuth(to, from, next) {
    permissionCheck(null, next);
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

        {
            path: '/users',
            name: 'UsersHome',
            component: Pages.Users.Home,
            children: [
                {
                    path: 'register/:permissions',
                    name: 'Register',
                    component: Pages.Users.Register,
                    props: true,
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
                    beforeEnter: requireAuth,
                    props: true,
                },
                { path: '*', redirect: '/404' },
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
            redirect: {
                name: 'ClassList',
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
                { path: '*', redirect: '/404' },
            ],
        },
        { path: '/404', name: 'NotFound', component: Pages.Admin.NotFound },
        { path: '*', beforeEnter: destinationError },
    ],
});
