import Home from './Home.vue';
import Login from './Login.vue';
import Register from './Register.vue';

import Admin from './Admin.vue';
import Designer from './Designer.vue';
import View from './View.vue';
import Student from './Student.vue';

import ClassesHome from './Classes/Index.vue';
import ClassesList from './Classes/List.vue';
import ClassDetails from './Classes/Details.vue';

export default {
    Home,
    Admin,
    Designer,
    View,
    Student,

    Users: {
        Login,
        Register,
    },

    Classes: {
        Home: ClassesHome,
        List: ClassesList,
        Details: ClassDetails,
    },
};
