<template>
    <div class="view">
        <div class="row">
            <div class="offset-2 col-8">
                <h1 class="ml-2">Class view</h1>
            </div>
        </div>
        <div class="ibox border-bottom offset-2 col-8">
            <div class="ibox-title">
                <h5>Groups</h5>
            </div>
            <div class="ibox-content">
                <div class="row">
                    <div class="col-6">
                        <div class="checkbox form-inline">
                            <label class="checkbox-container">
                                Show menu bar
                                <input type="checkbox">
                                <span class="checkmark"></span>
                            </label>
                            <label class="checkbox-container">
                                Send toolbar
                                <input type="checkbox">
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <button class="btn btn-primary p-2 my-3">Merge checked groups</button>
                    </div>
                    <div class="offset-1 col-5">
                        <div class="col-12 class-view-table">
                            <h2>Select class</h2>
                            <table class="table designer-class-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                <tr v-if="!classes.total > 0">
                                    <td></td>
                                    <td>
                                        No class
                                    </td>
                                    <td></td>
                                </tr>
                                    <tr v-for="cl in classes.data" :key="cl.id">
                                        <td>{{ cl.name }}</td>
                                        <td>{{ cl.code }}</td>
                                        <td class="text-center">
                                            <button
                                                v-if="code !== cl.code"
                                                @click="selectAllGroupsinClass(cl.code)"
                                                class="btn btn-sm btn-primary mr-2">
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            <div class="ibox border-bottom offset-2 col-8">
                <div class="ibox-title">
                    <h5>List groups</h5>
                </div>
            <div class="ibox-content">
                <div class="row">
                    <div class="col-12 form-inline">
                        <button class="btn btn-warning p-2">Clear Class</button>
                        <button class="btn btn-warning p-2 ml-2">Clear Group</button>
                    </div>
                </div>
            <div class="row groups-xml">
                <!--All groups xml-->
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import ToastrMixin from '@/mixins/ToastrMixin.vue';

export default {
    name: 'View',

    data() {
        return {
            code: undefined,
            groupsInClass: undefined,
        };
    },

    mixins: [ToastrMixin],

    computed: {
        ...mapGetters('classes', {
            findClassesInStore: 'find',
            getClass: 'get',
        }),

        ...mapGetters('groups', {
            findGroupsInStore: 'find',
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
        }),

        ...mapActions('groups', {
            findGroups: 'find',
        }),

        async selectAllGroupsinClass(code) {
            this.clearToast();

            this.code = code;
            this.groupsInClass = await this.findGroups({ query: { class: code } });

            if (!this.groupsInClass.length) {
                this.showToast('Selected class nas no groups', 'warning');
            }
        },
    },

    created() {
        this.findClasses();
    },
};
</script>
