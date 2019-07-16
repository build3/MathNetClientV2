<template>
<main class="login container">
    <div class="row">
        <div class="col-12 text-center">
            <h1 class="font-100">Create an Account</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-12">

            <div v-if="error"
                class="alert alert-danger alert-dismissible fade show"
                role="alert">
                {{ error }}
                <button
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
                        placeholder="User name"
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

export default {
    data() {
        return {
            username: undefined,
            password: undefined,
            error: undefined,
        };
    },

    methods: {
        dismissError() {
            this.error = undefined;
        },

        onSubmit(username, password) {
            this.dismissError();
            this.createUser({
                username,
                password,
                permissions: ['admin'],
            })
                // Automatically log the user in after successful signup.
                .then(() => this.authenticate({
                    strategy: 'local', username, password,
                }))
                .catch((error) => {
                    console.log(error);
                    this.error = (error.name === 'Conflict')
                        ? 'That username is already taken.'
                        : 'An error occured.';
                });
        },

        ...mapActions('users', {
            createUser: 'create',
        }),

        ...mapActions('auth', [
            'authenticate',
        ]),
    },
};
</script>
