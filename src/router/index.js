import Vue from 'vue';
import Router from 'vue-router';
import Admin from '@/components/Pages/Admin.vue';
import Designer from '@/components/Pages/Designer.vue';
import Home from '@/components/Pages/Home.vue';
import Login from '@/components/Pages/Login.vue';
import Register from '@/components/Pages/Register.vue';
import View from '@/components/Pages/View.vue';
import Student from '@/components/Pages/Student.vue';

Vue.use(Router);

export default new Router({
    routes: [
        { path: '', name: 'Home', component: Home },
        { path: '/register', name: 'Register', component: Register },
        { path: '/login', name: 'Login', component: Login },
        { path: '/admin', name: 'Admin', component: Admin },
        { path: '/designer', name: 'Designer', component: Designer },
        { path: '/view', name: 'View', component: View },
        { path: '/student', name: 'Student', component: Student },
    ],
});
