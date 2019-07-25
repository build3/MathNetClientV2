<template>
    <div class="student-class">
        <div class="row">
            <div class="offset-2 col-8">
                <h1>Student Class View</h1>
            </div>
            <div class="ibox border-bottom offset-2 col-8">
                <div class="ibox-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    Class
                                    <span class="footable-sort-indicator"></span>
                                </th>
                                <th>
                                    Code
                                    <span class="footable-sort-indicator"></span>
                                </th>
                                <th>
                                    Action
                                    <span class="footable-sort-indicator"></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="cl in classes.data" :key="cl.code">
                                <td>
                                    <span class="footable-toggle"></span>
                                    {{ cl.name }}
                                </td>
                                <td class="footable-visible">
                                    <span class="footable-toggle"></span>
                                    {{ cl.code }}
                                </td>
                                <td class="footable-visible">
                                    <router-link :to="{
                                            name: 'StudentGroup',
                                            params: { id: cl._id }
                                        }"
                                        class="btn btn-primary btn-xs">
                                        Join Class
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'StudentClass',

    computed: {
        ...mapGetters('classes', {
            findClassesInStore: 'find',
        }),

        classes() {
            return this.findClassesInStore();
        },
    },

    methods: {
        ...mapActions('classes', {
            findClasses: 'find',
        }),
    },

    created() {
        this.findClasses();
    },
};
</script>
