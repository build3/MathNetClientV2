<template>
    <div class="student-geogebra">
        <div class="row">
            <div ref="ibox" class="ibox col-12">
                <div class="ibox-content geogebra-frame1">
                    <div ref="content" class="geogebra-interface">
                        <div id="geogebra-view">
                            <!--Geogebra applet-->
                        </div>
                    </div>

                    <!-- Temporarily disabled; do not remove -->
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
import { StudentClient } from '../../Geogebra/StudentClient';

import api from '../../../feathers-client';
import StudentListener from './StudentListener';

export default {
    name: 'StudentGeogebra',

    computed: {
        ...mapGetters('users', {
            student: 'current',
            findStudentInStore: 'find',
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

        ...mapActions('users', [
            'patch',
        ]),

        /**
         * Removes user from all workshops and joins the current one.
         * This ensures that student is at most in one workshop channel.
         */
        async joinWorkshop() {
            await api.service('users').patch(this.student.username, {
                workshops: [this.id],
            });

            this.student.workshops = [this.id];
        },

        async leaveWorkshop() {
            await api.service('users').patch(this.student.username, {
                workshops: [],
            });

            this.student.workshops = [];
        },

        studentNumber() {
            const numberOfStudentsInGroup = this.findStudentInStore({
                query: {
                    workshops: {
                        $in: [this.group._id],
                    },
                    permissions: {
                        $in: ['student'],
                    },
                    numberInGroup: {
                        $ne: null,
                    },
                    $select: ['numberInGroup'],
                },
            });

            if (numberOfStudentsInGroup.data.length === 0) {
                return 1;
            }

            const number = numberOfStudentsInGroup.data
                .findIndex(({ numberInGroup }, index) => numberInGroup !== index + 1);

            if (number === -1) {
                return numberOfStudentsInGroup.data.length + 1;
            }

            return number + 1;
        },

        async saveUserNumber() {
            await this.patch([this.student.username, { numberInGroup: this.studentNumber() }]);
        },
    },

    async created() {
        await this.getGroup(this.id);
        this.$store.commit('setStudentGroup', this.group);
        this.saveUserNumber();
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

        const maxWidth = (this.$refs.content.clientWidth ? 1600 : this.$refs.content.clientWidth)

        const client = new StudentClient({
            container: 'geogebra-view',
            width: maxWidth,
            height: maxWidth * 9 / 16,
            log: this.$log,
        });

        const listener = new StudentListener(
            client,
            this.student.username,
            this.id,
            this.student.color,
            this.$log,
            this.student.numberInGroup,
        );

        client.initApplet(listener);
    },

    async beforeDestroy() {
        this.$store.commit('setStudentGroup', undefined);
        await this.leaveWorkshop();
    },
};
</script>
