<template functional>
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
                <li v-if="!logIn">
                    <router-link :to="{name: 'Login'}">
                        Login
                    </router-link>
                </li>
                <li v-if="!logIn">
                    <router-link :to="{name: 'Register'}">
                        Register
                    </router-link>
                </li>
                <li v-if="logIn">
                    <a href="#" class="logout button button-primary" @click="logout()">Sign Out</a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    name: 'PageHeader',
    computed: {
        ...mapState('auth', [
            'accessToken',
        ]),
    },
    methods: {
        logout() {
            this.logout().then(() => {
                this.user.authenticated = false;
                this.$router.push('/home');
            });
        },
    },
    ...mapActions('auth', [
        'logout',
    ]),
};
</script>
