<template>
    <div id="wrapper">
        <side-menu/>

        <main id="page-wrapper" class="gray-bg">
            <page-header/>
            <div class="wrapper wrapper-content">
                <router-view></router-view>
            </div>
        </main>

    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'App',

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
};
</script>
