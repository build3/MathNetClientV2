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
