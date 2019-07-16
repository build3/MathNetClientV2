<template>
    <main class="login container">
        <div class="row">
            <div class="col-12 text-center">
                <h1 class="font-100">Login to Account</h1>
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
                            placeholder="User password"
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
            console.log(username, password);
            this.dismissError();
            this.authenticate({
                strategy: 'local',
                username,
                password,

            })
                .then((result) => {
                    const token = result;
                    localStorage.setItem('accessToken', token);
                    this.retriveToken(token);
                    this.$router.push('/admin');
                })
                .catch((error) => {
                    this.error = (error.name === 'not-authenticated')
                        ? 'Incorrect email or password.'
                        : 'An error prevented login.';
                });
        },
        ...mapActions([
            'retriveToken',
        ]),

        ...mapActions('auth', [
            'authenticate',
        ]),
    },


};
</script>
