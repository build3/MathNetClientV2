<template>
    <nav class="navbar-static-side">
        <ul class="nav metismenu" id="side-menu">
            <li class="nav-header">
                <div class="dropdown profile-element" v-if="user">
                    <a data-toggle="dropdown" class="dropdown-toggle" href="#">
                        <span class="block m-t-xs font-bold">
                            Hello, {{ user.username }}
                        </span>
                    </a>
                </div>
            </li>
            <li v-if="user.permissions.indexOf('admin') > -1">
                <router-link :to="{name: 'Admin'}">
                    Admin
                </router-link>
                <router-link :to="{name: 'ClassesList'}">
                    Classes
                </router-link>
                <router-link :to="{name: 'Designer'}">
                    Designer
                </router-link>
                <router-link :to="{name: 'View'}">
                    View
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'SideMenu',

    computed: {
        ...mapGetters('users', {
            user: 'current',
        }),
    },
};
</script>
