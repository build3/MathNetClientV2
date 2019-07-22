import Home from './Home.vue';

import UsersHome from './Users/Index.vue';
import Login from './Users/Login.vue';
import Register from './Users/Register.vue';
import Profile from './Users/Profile.vue';

import Admin from './Admin/Admin.vue';
import Designer from './Admin/Designer.vue';
import View from './Admin/View.vue';

import ClassesHome from './Classes/Index.vue';
import ClassesList from './Classes/List.vue';
import ClassDetails from './Classes/Details.vue';

import StudentClass from './Student/StudentClass.vue';
import StudentGroup from './Student/StudentGroup.vue';
import StudentGeogebra from './Student/StudentGeogebra.vue';

export default {
    Home,

    Admin: {
        Admin,
        Designer,
        View,
    },

    Users: {
        Home: UsersHome,
        Login,
        Register,
        Profile,
    },

    Student: {
        StudentClass,
        StudentGroup,
        StudentGeogebra,
    },

    Classes: {
        Home: ClassesHome,
        List: ClassesList,
        Details: ClassDetails,
    },
};
