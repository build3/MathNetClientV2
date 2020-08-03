<template>
<div class="view">
    <div class="row">
        <div class="offset-2 mb-2 col-8">
            <h1>Classes</h1>
        </div>
        <div class="ibox border-bottom offset-2 col-8">
            <div class="ibox-content">
                <alert :alert="alert" />
                <table class="table" v-if="!editMode">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!classes.total > 0">
                            <td colspan="3" class="text-center">No class</td>
                        </tr>
                        <tr v-for="cl in classes.data" :key="cl.code">
                            <td>{{ cl.name }}</td>
                            <td>{{ cl.code }}</td>
                            <td>
                                <router-link
                                    :to="{
                                        name: 'ClassDetails',
                                        params: { code: cl.code }
                                    }"
                                    class="btn btn-sm btn-primary mr-2">
                                    Details
                                </router-link>
                                <button class="btn btn-sm btn-primary mr-2"
                                    @click="editClass(cl)">
                                    Edit Class
                                </button>
                                <button class="btn btn-sm btn-primary mr-2"
                                    :disabled="studentClassCode == cl.code"
                                    @click="selectClass(cl.code, cl.name)">
                                    Select class
                                </button>
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
                    <h3 v-if="!currentlyEdited">Add Class</h3>
                    <h3 v-else>Edit Class</h3>

                    <div class="form-group">
                        <input class="form-control"
                            type="text"
                            v-model="classname"
                            placeholder="Class Name"
                            required>
                    </div>
                    <div class="form-group"
                        v-if="!currentlyEdited">
                        <input class="form-control"
                            type="text"
                            v-model="code"
                            placeholder="Class Code">
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
import { mapState, mapGetters, mapActions } from 'vuex';

import AlertMixin from '@/mixins/AlertMixin.vue';
import ToastrMixin from '@/mixins/ToastrMixin.vue';

export default {
    name: 'ClassList',

    mixins: [AlertMixin, ToastrMixin],

    data() {
        return {
            classname: undefined,
            code: undefined,
            editMode: false,
            currentlyEdited: undefined,
            selectedClassCode: undefined
        };
    },

    computed: {
        ...mapState(['studentClassCode', 'className']),

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
            patch: 'patch',
        }),

        editClass(cl) {
            this.classname = cl.name;
            this.code = cl.code;
            this.currentlyEdited = cl.code;
            this.editMode = true;
        },

        selectClass(code, name) {
            this.selectedClassCode = code;

            this.$store.commit('setClassName', name);

            window.localStorage.setItem('code', code);
            window.localStorage.setItem('selectedClassName', name);

            this.showToast(`Selected class <b>${name}</b>`, 'success');
        },

        async onSubmit(classname, code) {
            this.dismissAlert();

            try {
                if (!this.currentlyEdited) {
                    await this.create({
                        name: classname,
                        code,
                    });
                } else {
                    await this.patch([
                        this.currentlyEdited,
                        {
                            name: classname,
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
        this.$store.commit('setStudentClassCode', window.localStorage.code);
        this.$store.commit('setClassName', window.localStorage.selectedClassName);
    },

    watch: {
        selectedClassCode(newValue) {
            this.$store.commit('setStudentClassCode', this.selectedClassCode);
        },

        editMode(newValue) {
            if (!newValue) {
                this.classname = undefined;
                this.code = undefined;
                this.currentlyEdited = undefined;
            }
        },
    },
};
</script>
