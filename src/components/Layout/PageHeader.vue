<template>
    <div class="row border-bottom">
        <nav class="navbar navbar-static-top bg-white">
            <div class="navbar-header">
                <div class="ping-section">
                    <p>Ping:</p><p v-if="!ping">waiting</p><p>{{ ping }}</p>
                </div>
            </div>
            <ul class="nav navbar-top-links navbar-right">
                <li v-if="!isLoggedIn">
                    <router-link :to="{name: 'Login'}">
                        Login
                    </router-link>
                </li>
                <li v-if="!isLoggedIn">
                    <router-link
                        :to="{
                            name: 'Register',
                            params: { permissions: 'student' }
                        }">
                        Register Student
                    </router-link>
                </li>
                <li v-if="!isLoggedIn" class="register-teacher">
                    <router-link
                        :to="{
                            name: 'Register',
                            params: { permissions: 'admin' }
                        }">
                        Register Teacher
                    </router-link>
                </li>
                <li v-if="isStudent">
                    <router-link :to="{name: 'StudentClass'}">
                        Class List
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
import { mapGetters, mapActions } from 'vuex';

import feathersClient from '../../feathers-client';

export default {
    name: 'PageHeader',

    data() {
        return {
            ping: '',
            pingTime: '',
        };
    },

    computed: {
        ...mapGetters('users', {
            user: 'current',
        }),

        isLoggedIn() {
            return this.user !== null;
        },

        isStudent() {
            return this.user && this.user.permissions.includes('student');
        },
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
                this.$router.push({ name: 'Login' });
                this.clearCurrent();
            });
        },

        checkPing() {
            setInterval(() => {
                this.pingTime = Date.now();
                feathersClient.io.emit('ping-rate');
            }, 2000);

            feathersClient.io.on('pong-rate', () => {
                this.ping = Date.now() - this.pingTime;
            });
        },
    },
    created() {
        this.checkPing();
    },
};
</script>
