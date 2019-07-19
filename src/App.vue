<template>
    <div id="wrapper">
        <div v-if="checkPermission()">
            <side-menu />

        <main id="page-wrapper" class="gray-bg">
            <page-header/>
            <div class="wrapper wrapper-content">
                <div v-if="!loaded">Loading</div>
                <router-view v-else></router-view>
            </div>
        </main>
        </div>
        <div v-else>
            <main class="gray-bg student-main">
                <page-header/>
                <div class="wrapper wrapper-content">
                    <router-view></router-view>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
    name: 'App',

    data() {
        return {
            loaded: false,
        };
    },

    computed: {
        ...mapState('auth', [
            'isAuthenticatePending',
            'user',
        ]),
        ...mapGetters('users', {
            user: 'current',
        }),
    },

    methods: {
        ...mapActions('auth', [
            'authenticate',
        ]),
        checkPermission() {
            if (this.user) {
                if (this.user.permissions.indexOf('student') > -1) {
                    return false;
                }

                return true;
            }

            return true;
        },
    },

    mounted() {
        this.authenticate()
            .catch((error) => {
                if (!error.message.includes('Could not find stored JWT')) {
                    console.error(error);
                }
            });
    },

    watch: {
        isAuthenticatePending(newValue) {
            if (!newValue) {
                if (!this.user) {
                    this.$router.replace({ name: 'Login' });
                }
                this.loaded = true;
            }
        },
    },
};
</script>
