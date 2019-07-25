<template>
    <div class="student-group">
        <div class="row">
            <div class="offset-2 col-8">
                <h1>Student Group View</h1>
            </div>
            <div class="ibox border-bottom offset-2 col-8">
                <div class="ibox-content">
                    <table class="footable table table-stripped
                        tablet breakpoint footable-loaded" data-page-size="15">
                        <thead>
                            <tr>
                                <th data-toggle="true"
                                    class="footable-visible
                                        footable-first-column footable-sortable">
                                    Groups
                                    <span class="footable-sort-indicator"></span>
                                </th>
                                <th data-hide="action"
                                    class="footable-visible footable-sortable">
                                    Action
                                    <span class="footable-sort-indicator"></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="!groups.total > 0">
                                <td class="text-center">
                                    No groups
                                </td>
                            </tr>
                            <tr class="footable-even"
                                v-for="(g, index) in groups.data" :key="index" >
                                <td class="footable-visible footable-first-column">
                                    <span class="footable-toggle"></span>
                                    {{ g.name }}
                                </td>
                                <td class="footable-visible">
                                    <router-link :to="{
                                            name: 'StudentGeogebra',
                                            params: {
                                                id: g._id,
                                            }
                                        }"
                                        class="btn btn-primary btn-xs">
                                        Join Group
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                        <router-link :to="{name: 'StudentClass'}">
                            <button class="btn btn-danger mt-3">Leave Class</button>
                        </router-link>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'StudentGroup',

    computed: {

        ...mapGetters('groups', {
            findGroupsInStore: 'find',
        }),

        groups() {
            return this.findGroupsInStore({
                query: { class: this.id },
            });
        },
    },

    methods: {
        ...mapActions('groups', {
            findGroups: 'find',
        }),
    },

    created() {
        this.findGroups();
    },

    props: {
        /** The id of the class we're currently in. */
        id: {
            default: '',
            type: String,
        },
    },
};
</script>
