<template>
    <div class="row border-bottom">
        <nav class="navbar navbar-static-top bg-white">
            <div class="navbar-header">
                <div class="ping-section">
                    <p>Ping:</p><p v-if="!ping">waiting</p><p>{{ ping }}</p>
                </div>
            </div>
            <ul class="nav navbar-top-links navbar-right">
                <li v-if="checkPermission()">
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
                    <router-link :to="{name: 'Profile'}">
                        Profile
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
import io from 'socket.io-client';
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'PageHeader',

    data() {
        return {
            ping: '',
            socket: io('http://localhost:3030'),
            pingTime: '',
        };
    },

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
        checkPermission() {
            if (this.isLoggedIn) {
                if (this.isLoggedIn.permissions.indexOf('student') > -1) {
                    return false;
                }

                return true;
            }

            return true;
        },
        checkPing() {
            setInterval(() => {
                this.pingTime = Date.now();
                this.socket.emit('ping-rate');
            }, 2000);

            this.socket.on('pong-rate', () => {
                this.ping = Date.now() - this.pingTime;
            });
        },
    },
    created() {
        this.checkPing();
    },
};
</script>
