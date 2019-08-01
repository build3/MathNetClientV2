<template>
    <div class="student-geogebra">
        <div class="row">
            <div ref="ibox" class="ibox border-bottom offset-1 col-10">
                <div class="ibox-title form-inline">
                    <h3 v-if="group">
                        {{ group.name }}, {{ student.username }}
                    </h3>
                    <div class="leave-option">
                        <router-link v-if="group"
                            :to="{
                                name: 'StudentGroup',
                                params: {
                                    id: group.class,
                                },
                            }"
                            class="btn btn-danger">
                            Leave Group
                        </router-link>
                    </div>
                </div>
                <div class="ibox-content geogebra-frame">
                    <div id="geogebra-view">
                        <!--Geogebra applet-->
                    </div>
                    <!-- <div class="control-options">
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
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { StudentClient, Consts } from '../../Geogebra/StudentClient';

import api from '../../../feathers-client';
import StudentListener from './StudentListener';

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

        /**
         * Removes user from all workshops and joins the current one.
         * This ensures that student is at most in one workshop channel.
         */
        async joinWorkshop() {
            await api.service('users').patch(this.student.username, {
                workshops: [this.id]
            });

            this.student.workshops = [this.id];
        }
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

    async mounted() {
        this.$log.debug('Student: ', this.student.workshops);

        await this.joinWorkshop();

        const client = new StudentClient({
            container: 'geogebra-view',
            width: this.$refs.ibox.clientWidth,
            log: this.$log,
        });

        const listener = new StudentListener(
            client,
            this.student.username,
            this.id,
            this.student.color,
            this.$log,
        );

        client.initApplet(listener);
    }
};
</script>
