import Admin from './Admin.vue';
import Home from './Home.vue';
import Login from './Login.vue';
import Register from './Register.vue';

import ClassesHome from './Classes/Index.vue';
import ClassesList from './Classes/List.vue';
import ClassDetails from './Classes/Details.vue';

export default {
    Home,

    Users: {
        Admin,
        Login,
        Register,
    },

    Classes: {
        Home: ClassesHome,
        List: ClassesList,
        Details: ClassDetails,
    },
};
