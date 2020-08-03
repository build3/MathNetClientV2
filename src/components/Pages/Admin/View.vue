<template>
    <div class="view">
        <div class="ibox border-bottom col-12">
            <div class="ibox-title">
                <h5>Groups</h5>
            </div>
            <div ref="ibox_content" class="ibox-content">
                <div class="row">
                    <div class="col-12">
                        <div class="row mb-5">
                            <div class="col-4">
                                <div v-if="classSelected">
                                    <div class="mt-1 group-choices">
                                        <h3 class="mb-3">Check groups to merge:</h3>
                                        <div v-for="g in groupsInClass"
                                            :key="g._id"
                                            class="admin-view-check-panel">
                                                <label class="checkbox-container"
                                                    :for="`checkbox_${g._id}`">
                                                    {{ g.name }}
                                                    <input type="checkbox"
                                                        :id="`checkbox_${g._id}`"
                                                        :value="g._id"
                                                        v-model="checkedGroups">
                                                    <span class="checkmark"></span>
                                                </label>
                                        </div>
                                        <button class="btn btn-primary p-2 mt-2"
                                            @click="mergeViews(checkedGroups)">
                                            Merge checked groups
                                        </button>
                                        <button class="btn btn-warning p-2 mt-2"
                                            @click="unmergeViews()">
                                            Unmerge groups views
                                        </button>
                                    </div>
                                    <!-- <div class="checkbox form-inline">
                                        <label class="checkbox-container">
                                            Send toolbar
                                            <input type="checkbox">
                                            <span class="checkmark"></span>
                                        </label>
                                    </div> -->
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div v-if="showMergedApplet">
                                <div class="merged-live-switch">
                                    <div class="onoffswitch">
                                        <input type="checkbox" checked
                                            class="onoffswitch-checkbox"
                                            id="live_switch"
                                            v-model="liveMergeSwitch">
                                        <label class="onoffswitch-label" for="live_switch">
                                            <span class="onoffswitch-inner"></span>
                                            <span class="onoffswitch-switch"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div v-if="showMergedApplet"
                                id="merged_ggb_applet"
                                class="merged-geogebra-applet"
                                ref="geogebra_merged_applet_container">
                                <!-- Merged Geogebra Applet Here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ibox border-bottom col-12">
                <div class="ibox-title">
                    <h5>List groups</h5>
                </div>
                <div class="ibox-content">
                    <div class="row">
                        <div v-for="g in groupsInClass" :key="g._id"
                            class="admin-view-applet-holder">
                            <h3>{{ g.name }}</h3>
                            <div class="group-color" :style="groupColor(g.color)"></div>
                            <div :id="getAppletId(g._id)" class="geogebra-applet">
                                <!-- Geogebra Teacher's view applets -->
                            </div>
                        </div>
                    </div>
                    <!-- <div class="row">
                        <div class="col-12 form-inline">
                            <button class="btn btn-warning p-2">Clear Class</button>
                            <button class="btn btn-warning p-2 ml-2">Clear Group</button>
                        </div>
                    </div> -->
                <div class="row groups-xml">
                    <!--All groups xml-->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import feathersClient from '../../../feathers-client';
import GeogebraViews from '../../Geogebra/GeogebraViews';
import ToastrMixin from '@/mixins/ToastrMixin.vue';

const api = feathersClient;

export default {
    name: 'View',

    data() {
        return {
            code: undefined,
            groupsInClass: undefined,
            GeogebraViews: undefined,
            checkedGroups: [],
            showMergedApplet: false,
            liveMergeSwitch: true,
            classSelected: false,
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

        ...mapGetters('users', {
            user: 'current',
        }),

        classes() {
            return this.findClassesInStore({
                query: { $sort: { code: 1 } },
            });
        },
    },

    methods: {
        groupColor(color) {
            return(`background:rgb(${color})`);
        },

        ...mapActions('classes', {
            findClasses: 'find',
        }),

        ...mapActions('groups', {
            findGroups: 'find',
        }),

        /**
         * async selectAllGroupsinClass
         *
         * @param  {String} code Class code
         * @return {undefined}
         */
        async selectAllGroupsinClass(code) {
            this.$log.debug(code);

            this.clearToast();

            this.showMergedApplet = false;

            this.code = code;
            window.localStorage.setItem('code', code);

            this.groupsInClass = await this.findGroups({
                query: { class: code },
            });

            if (!this.groupsInClass.length) {
                this.showToast('Selected class nas no groups', 'warning');
            } else {
                this.classSelected = true;
            }

            this.loadApplets();
        },

        getAppletId(id) {
            return `ggb_applet_${id}`;
        },

        async loadApplets() {
            this.$log.debug();

            if (this.groupsInClass && this.groupsInClass.length) {
                this.$log.debug(this.groupsInClass);

                await api.service('users').patch(this.user.username, {
                    workshops: this.groupsInClass.map(g => g._id),
                });

                const tileWidth = 400;
                const tileHeight = 225;

                this.GeogebraViews = new GeogebraViews(this.groupsInClass, {
                    log: this.$log,
                    width: tileWidth, // this.$refs.ibox_content.clientWidth - 60,
                    height: tileHeight,
                });

                this.GeogebraViews.inject();
            }
        },

        async mergeViews(checkedGroupIds) {
            this.showMergedApplet = true;
            this.liveMergeSwitch = true;

            this.selectedGroups = await this.findGroups({ query: { _id: checkedGroupIds } });

            this.$log.debug('checkedGroupIds', checkedGroupIds);
            this.$log.debug('this.selectedGroups', this.selectedGroups);

            if (this.selectedGroups && this.selectedGroups.length) {
                /* await api.service('users').patch(this.user.username, {
                    workshops: this.selectedGroups.map(g => g._id),
                }); */

                const ggbWidth = 1366; //this.$refs.ibox_content.clientWidth - 60;
                this.$log.debug('ggbWidth', ggbWidth);

                this.GeogebraViews.mergeViews(
                    this.selectedGroups.map(g => g._id),
                    { // params for geogebra
                        showMenubar: true,
                        // Geogebra reprocesses this width/height.
                        // The proper width, to fill the window
                        // was obtained with ratio height/width = 2/3
                        width: ggbWidth,
                        height: ggbWidth * 9 / 16,
                        groups: this.selectedGroups
                    },
                );

                this.GeogebraViews.mergeGoLive();
            } else {
                this.showToast('Select groups for merged view', 'warning');
                this.showMergedApplet = false;
            }
        },

        async unmergeViews() {
            if (this.showMergedApplet) {
                this.showMergedApplet = false;
                this.liveMergeSwitch = false;

                this.showToast('Merged groups views are <b>unmerged</b>', 'success');
            } else {
                this.showToast('No views to <b>unmerge</b>', 'warning');
            }
        },
    },

    async created() {
        if (window.localStorage.code) {
            this.selectAllGroupsinClass(window.localStorage.code);
        }

        await this.findClasses();
    },

    watch: {
        liveMergeSwitch(newVal) {
            if (newVal) {
                this.GeogebraViews.mergeGoLive();
            } else {
                this.GeogebraViews.mergeStopLive();
            }
        },
    },

};
</script>
