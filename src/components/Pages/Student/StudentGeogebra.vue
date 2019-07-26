<template>
    <div class="student-geogebra">
        <div class="row">
        <div class="offset-2 col-8">
            <h1>Student Geogebra View</h1>
        </div>
            <div class="ibox border-bottom offset-2 col-8">
                <div class="ibox-title form-inline">
                    <h3 v-if="group">
                        {{ group.name }}, {{ student.username }}
                    </h3>
                    <div class="leave-option">
                        <router-link v-if="group"
                            :to="{
                                name: 'StudentGroup',
                                params: {
                                    code: group.class,
                                },
                            }"
                            class="btn btn-danger">
                            Leave Group
                        </router-link>
                    </div>
                </div>
                <div class="ibox-content">
                    <div class="geogebra-view">
                        <!--Geogebra applet-->
                    </div>
                    <div class="control-options">
                        <div class="col-8">
                            <button class="btn btn-info center-btn-up">Up(I)</button>
                            <div class="form-inline">
                                <button class="btn btn-info m-2">Left(J)</button>
                                <p class="mt-3 p-2">Selected object:</p>
                                <button class="btn btn-info m-2">Right(L)</button>
                            </div>
                            <button class="btn btn-info center-btn-down">Down(K)</button>
                            <div class="slidecontainer mt-4">
                                <input type="range" min="1" max="10" value="1"
                                    class="slider" id="myRange">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'StudentGeogebra',

    computed: {
        ...mapGetters('users', {
            student: 'current',
        }),

        ...mapGetters('groups', [
            'get',
        ]),

        group() {
            return this.get(this.id);
        },
    },

    methods: {
        ...mapActions('groups', {
            getGroup: 'get',
        }),
    },

    created() {
        this.getGroup(this.id);
    },

    props: {
        /** The id of the group we're currently in. */
        id: {
            default: '',
            type: String,
        },
    },
};
</script>
