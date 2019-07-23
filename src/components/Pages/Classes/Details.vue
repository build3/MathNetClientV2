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
                <alert :alert="alert" />

                <table class="table" v-if="!editMode">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(g, index) in groups.data" :key="index">
                            <td>{{ g.name }}</td>
                            <td>
                                <button class="btn btn-sm btn-primary mr-2"
                                    @click="editGroup(g)">
                                    Edit Group
                                </button>
                                <button class="btn btn-sm btn-danger"
                                    @click="deleteGroup(g)">
                                    Delete Group
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <form v-else
                    @submit.prevent="onSubmit(groupName)">
                    <h3>Add Group</h3>

                    <div class="form-group">
                        <input class="form-control"
                            type="text"
                            v-model="groupName"
                            placeholder="Group Name"
                            required>
                    </div>
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button class="btn btn-secondary"
                        @click.prevent="editMode = false">
                        Cancel
                    </button>
                </form>

                <button
                    v-if="!editMode"
                    class="btn btn-primary"
                    @click="editMode = true">
                    Add Group
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import AlertMixin from '@/mixins/AlertMixin.vue';

export default {
    name: 'ClassDetails',

    mixins: [AlertMixin],

    data() {
        return {
            alert: undefined,
            groupName: undefined,
            editMode: false,
            currentlyEdited: undefined,
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
            patch: 'patch',
        }),

        editGroup(group) {
            this.groupName = group.name;
            this.currentlyEdited = group._id;
            this.editMode = true;
        },

        async onSubmit(groupName) {
            this.dismissAlert();

            try {
                if (!this.currentlyEdited) {
                    await this.create({
                        name: groupName,
                        class: this.code,
                    });
                } else {
                    await this.patch([
                        this.currentlyEdited,
                        {
                            name: groupName,
                        },
                    ]);
                }

                this.editMode = false;
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

    watch: {
        editMode(newValue) {
            if (!newValue) {
                this.groupName = undefined;
            }
        },
    },
};
</script>
