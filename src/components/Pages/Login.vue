<template>
    <main class="login container">
        <div class="row">
            <div class="col-12 text-center">
                <h1 class="font-100">Login to Account</h1>
            </div>
        </div>
        <div class="row">
            <div class="col-8 offset-2">

                <div v-if="alert"
                    class="alert alert-dismissible fade show"
                    :class="'alert-' + alert.type"
                    role="alert">
                    {{ alert.message }}
                    <button v-if="alert.type === 'danger'"
                        type="button"
                        class="close"
                        data-dismiss="alert"
                        aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

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
                        Login
                    </button>
                </form>
            </div>
        </div>
    </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            username: undefined,
            password: undefined,
            alert: undefined,
        };
    },
    computed: {
        ...mapGetters('users', {
            user: 'current',
        }),
    },
    methods: {
        dismissAlert() {
            this.alert = undefined;
        },

        async onSubmit(username, password) {
            this.dismissAlert();
            this.alert = {
                type: 'info',
                message: 'Logging in...',
            };
            try {
                await this.authenticate({
                    strategy: 'local',
                    username,
                    password,
                });
                if (this.user.permissions.indexOf('admin') > -1) {
                    this.$router.push('/admin');
                } else {
                    this.$router.push('/student');
                }
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.name === 'not-authenticated'
                        ? 'Incorrect email or password.'
                        : 'An error prevented login.',
                };
            }
        },

        ...mapActions('auth', [
            'authenticate',
        ]),
    },


};
</script>
