<template>
<main class="login container">
    <div class="row">
        <div class="col-12 text-center">
            <h1 class="font-100">{{ title }}</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-8 offset-2">

            <alert :alert="alert" />

            <form class="form" method="post"
                @submit.prevent="onSubmit(username, password)">
                <div class="form-group">
                    <input class="form-control"
                        v-model="username"
                        type="text"
                        name="username"
                        placeholder="Username"
                        required>
                </div>

                <div class="form-group">
                    <input class="form-control"
                        v-model="password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        required>
                </div>

                <button type="submit" class="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    </div>
</main>
</template>

<script>
import { mapActions } from 'vuex';

import AlertMixin from '@/mixins/AlertMixin.vue';

export default {
    data() {
        return {
            username: undefined,
            password: undefined,
        };
    },

    mixins: [AlertMixin],

    computed: {
        title() {
            const type = this.permissions === 'student' ? 'Student' : 'Teacher';
            return `Create a ${type} Account`;
        },
    },

    methods: {
        async onSubmit(username, password) {
            this.dismissAlert();
            this.alert = {
                type: 'info',
                message: 'Registering...',
            };
            try {
                await this.createUser({
                    username,
                    password,
                    permissions: [this.permissions],
                });
                // Automatically log the user in after successful signup.
                await this.authenticate({
                    strategy: 'local', username, password,
                });

                if (this.permissions === 'student') {
                    this.$router.push({ name: 'StudentClass' });
                } else {
                    this.$router.push({ name: 'ClassList' });
                }
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.name === 'Conflict'
                        ? 'That username is already taken.'
                        : 'An error occured.',
                };
            }
        },

        ...mapActions('users', {
            createUser: 'create',
        }),

        ...mapActions('auth', [
            'authenticate',
        ]),
    },

    props: {
        permissions: {
            default: 'student',
            type: String,
        },
    },
};
</script>
