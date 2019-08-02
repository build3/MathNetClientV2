<template>
    <div id="wrapper">
        <div v-if="adminPermission">
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
import { mapGetters, mapState } from 'vuex';

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
        ]),

        ...mapGetters('users', {
            user: 'current',
        }),

        adminPermission() {
            return this.user && this.user.permissions.includes('admin');
        },
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
