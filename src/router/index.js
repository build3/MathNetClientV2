import Vue from 'vue';
import Router from 'vue-router';
import Admin from '@/components/Pages/Admin/Admin.vue';
import Designer from '@/components/Pages/Admin/Designer.vue';
import Home from '@/components/Pages/Home.vue';
import Login from '@/components/Pages/Login.vue';
import Register from '@/components/Pages/Register.vue';
import View from '@/components/Pages/Admin/View.vue';
import StudentClass from '@/components/Pages/Student/StudentClass.vue';
import StudentGroup from '@/components/Pages/Student/StudentGroup.vue';
import StudentGeogebra from '@/components/Pages/Student/StudentGeogebra.vue';

Vue.use(Router);

export default new Router({
    routes: [
        { path: '', name: 'Home', component: Home },
        { path: '/register', name: 'Register', component: Register },
        { path: '/login', name: 'Login', component: Login },
        { path: '/admin', name: 'Admin', component: Admin },
        { path: '/designer', name: 'Designer', component: Designer },
        { path: '/view', name: 'View', component: View },
        { path: '/student-class', name: 'Student-Class', component: StudentClass },
        { path: '/student-group', name: 'Student-Group', component: StudentGroup },
        { path: '/student-geogebra', name: 'Student-Geogebra', component: StudentGeogebra },
    ],
});
