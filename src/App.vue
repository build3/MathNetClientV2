<template>
    <div id="wrapper">
        <side-menu/>

        <main id="page-wrapper" class="gray-bg">
            <page-header/>
            <div class="wrapper wrapper-content">
                <div v-if="!loaded">Loading</div>
                <router-view v-else></router-view>
            </div>
        </main>

    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

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
    },

    methods: {
        ...mapActions('auth', [
            'authenticate',
        ]),
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
