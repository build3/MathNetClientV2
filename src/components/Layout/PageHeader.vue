<template>
    <div class="row border-bottom">
        <nav class="navbar navbar-static-top bg-white">
            <div class="navbar-header">
                <div class="ping-section">
                    <p>[Demo build]</p>
                    <p>Ping:</p><p v-if="!ping">waiting</p><p class="ping-value">{{ ping }}</p>
                    <div v-if="user">
                        <p>Username:</p><p>{{ user.username }}</p>
                        <div v-if="isStudent">
                            <p>Group:</p><p v-if="studentGroup">{{ studentGroup.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <ul class="nav navbar-top-links navbar-right">
                <li v-if="isStudent && studentGroup !== undefined" class="group-info">
                    <div class="student-info">
                        <h4>Student number: {{ user.numberInGroup }} </h4>
                        <h4>Group: {{ studentGroup.name }}</h4>
                    </div>
                </li>
                <li v-if="isStudent && studentGroup !== undefined">
                    <router-link
                        @click.native="leaveGroup"
                        :to="{
                            name: 'StudentGroup',
                            params: {
                                code: studentGroup.class,
                            },
                        }">
                        Leave Group
                    </router-link>
                </li>
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
                    <router-link
                        @click.native="leaveGroup"
                        :to="{name: 'StudentClass'}">
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
import { mapGetters, mapActions, mapState } from 'vuex';

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

        ...mapState([
            'studentGroup',
        ]),
    },

    methods: {
        ...mapActions('auth', [
            'logout',
        ]),

        ...mapActions('users', [
            'clearCurrent',
            'patch',
        ]),

        async logoutUser() {
            if (this.user.permissions.includes('student')) {
                await this.patch([this.user.username, { workshops: [], numberInGroup: null }]);
            }

            this.logout().then(() => {
                this.$router.push({ name: 'Login' });
                this.clearCurrent();
            });

            // Clear code id from local storage
            window.localStorage.removeItem('code')
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

        async leaveGroup() {
            await this.patch([this.user.username, { workshops: [], numberInGroup: null }]);
        },

        logoutStudentUser(event) {
            if (this.isStudent) {
                this.logoutUser();
            }
        },
    },

    onIdle() {
        this.logoutStudentUser();
    },

    created() {
        this.checkPing();
        window.addEventListener('beforeunload', this.logoutStudentUser);
    },

};
</script>
