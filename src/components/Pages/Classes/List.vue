<template>
<div class="view">
    <div class="row">
        <div class="offset-2 col-8">
            <h1>Classes</h1>
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

                <table class="table" v-if="!editMode">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cl in classes.data" :key="cl.id">
                            <td>{{ cl.name }}</td>
                            <td>{{ cl.code }}</td>
                            <td class="text-center">
                                <router-link
                                    :to="{
                                        name: 'ClassDetails',
                                        params: { code: cl.code }
                                    }"
                                    class="btn btn-sm btn-primary mr-2">
                                    Details
                                </router-link>
                                <button class="btn btn-sm btn-danger"
                                    @click="deleteClass(cl.code)">
                                    Delete Class
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <form v-else
                    @submit.prevent="onSubmit(classname, code)">
                    <h3>Add Class</h3>

                    <div class="form-group">
                        <input class="form-control"
                            type="text"
                            v-model="classname"
                            placeholder="Class Name"
                            required>
                    </div>
                    <div class="form-group">
                        <input class="form-control"
                            type="text"
                            v-model="code"
                            placeholder="Class Code"
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
                    Add Class
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'ClassList',

    data() {
        return {
            alert: undefined,
            classname: undefined,
            code: undefined,
            editMode: false,
        };
    },

    computed: {
        ...mapGetters('classes', {
            findClassesInStore: 'find',
        }),

        classes() {
            return this.findClassesInStore({
                query: { $sort: { code: 1 } },
            });
        },
    },

    methods: {
        ...mapActions('classes', {
            findClasses: 'find',
            create: 'create',
            remove: 'remove',
        }),

        dismissAlert() {
            this.alert = undefined;
        },

        async onSubmit(classname, code) {
            this.dismissAlert();
            try {
                await this.create({
                    name: classname,
                    code,
                });
                this.editMode = false;
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        async deleteClass(code) {
            this.dismissAlert();
            try {
                await this.remove(code);
                this.alert = {
                    type: 'success',
                    message: 'Class Deleted',
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
        this.findClasses();
    },

    watch: {
        editMode(newValue) {
            if (!newValue) {
                this.classname = undefined;
                this.code = undefined;
            }
        },
    },
};
</script>
