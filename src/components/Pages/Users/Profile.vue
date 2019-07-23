<template>
    <main class="login container">
        <div class="row">
            <div class="col-8 offset-2">
                <h1>{{ user.username }}'s profile</h1>
            </div>
        </div>
        <div class="row">
            <div class="col-8 offset-2">
                <alert :alert="alert" />

                <form v-if="editMode"
                    @submit.prevent="onSubmit(
                        newPassword,
                        confirmNewPassword
                    )">
                    <h3>Change Password</h3>
                    <div class="form-group">
                        <input class="form-control"
                            type="password"
                            v-model="newPassword"
                            placeholder="New Password"
                            required>
                    </div>
                    <div class="form-group">
                        <input class="form-control"
                            type="password"
                            v-model="confirmNewPassword"
                            placeholder="Confirm New Password"
                            required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Change
                    </button>
                    <button class="btn btn-secondary"
                        @click.prevent="editMode = false">
                        Cancel
                    </button>
                </form>

                <button
                    v-if="!editMode"
                    class="btn btn-primary"
                    @click="editMode = true">
                    Change Password
                </button>
            </div>
        </div>
    </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import AlertMixin from '@/mixins/AlertMixin.vue';

export default {
    data() {
        return {
            newPassword: undefined,
            confirmNewPassword: undefined,
            editMode: true,
        };
    },

    mixins: [AlertMixin],

    computed: {
        ...mapGetters('users', {
            user: 'current',
        }),
    },

    methods: {
        async onSubmit(newPassword, confirmNewPassword) {
            this.dismissAlert();
            if (newPassword !== confirmNewPassword) {
                this.alert = {
                    type: 'danger',
                    message: 'Entered passwords don\'t match',
                };
            } else {
                try {
                    this.alert = {
                        type: 'info',
                        message: 'Changing...',
                    };

                    await this.patch([
                        this.user.username,
                        {
                            password: newPassword,
                        },
                    ]);

                    this.alert = {
                        type: 'success',
                        message: 'Password successfully changed',
                    };

                    // this.editMode = false;
                    // The next two lines should be deleted, and the above line
                    // uncommented, once profile consists of anyting more than
                    // password change form.
                    this.newPassword = undefined;
                    this.confirmNewPassword = undefined;
                } catch (error) {
                    this.alert = {
                        type: 'danger',
                        message: error.message,
                    };
                }
            }
        },

        ...mapActions('users', [
            'patch',
        ]),
    },

    watch: {
        editMode(newValue) {
            if (!newValue) {
                this.newPassword = undefined;
                this.confirmNewPassword = undefined;
            }
        },
    },
};
</script>
