<template>
    <nav class="navbar-default navbar-static-side">
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
            <router-link
                v-if="user"
                to="/classes"
                tag="li"
                active-class="active">
                <a>Classes</a>
            </router-link>
            <router-link
                v-if="user"
                :to="{name: 'Designer'}"
                tag="li"
                active-class="active">
                <a>Designer</a>
            </router-link>
            <router-link
                v-if="user"
                :to="{name: 'View'}"
                tag="li"
                active-class="active">
                <a>View</a>
            </router-link>
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
