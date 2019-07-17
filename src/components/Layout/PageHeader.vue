<template>
    <div class="row border-bottom">
        <nav class="navbar navbar-static-top">
            <div class="navbar-header">
            </div>
            <ul class="nav navbar-top-links navbar-right">
                <li>
                    <router-link :to="{name: 'Home'}">
                        Home
                    </router-link>
                </li>
                <li v-if="!isLoggedIn">
                    <router-link :to="{name: 'Login'}">
                        Login
                    </router-link>
                </li>
                <li v-if="!isLoggedIn">
                    <router-link :to="{name: 'Register'}">
                        Register
                    </router-link>
                </li>
                <li v-if="isLoggedIn">
                    <a href="#"
                        class="logout"
                        @click="logoutUser()">
                        Logout
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'PageHeader',

    computed: {
        ...mapGetters('users', {
            isLoggedIn: 'current',
        }),
    },

    methods: {
        ...mapActions('auth', [
            'logout',
        ]),

        ...mapActions('users', [
            'clearCurrent',
        ]),

        logoutUser() {
            this.logout().then(() => {
                this.$router.push('/home');
                this.clearCurrent();
            });
        },
    },
};
</script>
