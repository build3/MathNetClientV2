<template>
<div class="view">
    <div class="row">
        <div class="offset-2 col-8">
            <h1>Class {{ code }}</h1>
            <ol class="breadcrumb mb-2">
                <li class="breadcrumb-item">
                    <router-link :to="{ name: 'ClassList' }">
                        Classes
                    </router-link>
                </li>
                <li class="breadcrumb-item active">
                    <strong>{{ code }}</strong>
                </li>
            </ol>
        </div>
        <div class="ibox border-bottom offset-2 col-8">
            <div class="ibox-content">
                <div v-if="alert"
                    class="alert alert-dismissible fade show"
                    :class="'alert-' + alert.type"
                    role="alert">
                    {{ alert.message }}
                    <button v-if="alert.type !== 'info'"
                        type="button"
                        class="close"
                        data-dismiss="alert"
                        aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!groups.total > 0">
                            <td class="text-center">
                                No groups.
                            </td>
                        </tr>
                        <tr v-for="(g, index) in groups.data" :key="index">
                            <td>Group {{ index + 1 }}</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-danger"
                                    @click="deleteGroup(g)">
                                    Delete Group
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <button
                    class="btn btn-primary"
                    @click="addGroup">
                    Add Group
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'ClassDetails',

    data() {
        return {
            alert: undefined,
        };
    },

    computed: {

        ...mapGetters('groups', {
            findGroupsInStore: 'find',
        }),

        ...mapGetters('classes', {
            getClass: 'get',
        }),

        groups() {
            return this.findGroupsInStore({
                query: { class: this.code },
            });
        },
    },

    methods: {
        ...mapActions('groups', {
            findGroups: 'find',
            create: 'create',
            remove: 'remove',
        }),

        dismissAlert() {
            this.alert = undefined;
        },

        async addGroup() {
            this.dismissAlert();

            try {
                await this.create({
                    class: this.code,
                });
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        async deleteGroup(group) {
            this.dismissAlert();

            try {
                await this.remove(group);

                this.alert = {
                    type: 'success',
                    message: 'Group Deleted',
                };
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },
    },

    created() {
        this.findGroups();
    },

    props: {
        code: {
            default: '',
            type: String,
        },
    },
};
</script>
