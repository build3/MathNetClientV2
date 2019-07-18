<template>
    <div id="wrapper">
        <div v-if="checkPermission()">
            <side-menu />

        <main id="page-wrapper" class="gray-bg">
            <page-header/>
            <div class="wrapper wrapper-content">
                <router-view></router-view>
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
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'App',

    computed: {
        ...mapGetters('users', {
            user: 'current',
        }),
    },
    methods: {
        ...mapActions('auth', [
            'authenticate',
        ]),
        checkPermission() {
            if (this.user === null || this.user.permissions.indexOf('student')) {
                return true;
            }
            return false;
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
};
</script>
