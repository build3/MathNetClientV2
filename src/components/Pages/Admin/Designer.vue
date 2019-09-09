<template>
    <div class="designer">
        <div class="wrapper wrapper-content">
            <alert :alert="alert" />
            <div class="ibox border-bottom">
                <div class="ibox-content table-responsive ibox-style-extender">
                    <div class="row mt-2">
                        <div class="col-12" ref="geogebra_container">
                            <div class="geogebra_designer">
                                <div id="geogebra_designer"></div>
                            </div>
                            <button class="btn btn-warning reset-btn p-2 mt-4 mb-3"
                                    @click="resetView">
                                Reset view
                            </button>
                        </div>
                    </div>
                    <div class="row" v-if="!addMode">
                        <div class="col-6">
                                <h2>Constructions</h2>
                                <select
                                    multiple="multiple"
                                    class="form-control select-extender"
                                    v-model="selectedConstruction">
                                    <option
                                        v-for="
                                        construction in this.teacher.constructions"
                                        :key="construction.id">
                                        {{ construction }}
                                    </option>
                                </select>
                                <div class="mt-2">
                                    <button class="btn btn-primary p-2 mr-1 mt-2"
                                        @click="useConstruction()">
                                        Use construction</button>
                                    <button
                                        v-if="!addMode"
                                        class="btn btn-primary p-2 mr-1 mt-2"
                                        @click="addMode = true">
                                        Add Construction
                                    </button>
                                    <button class="btn btn-danger p-2 mr-1 mt-2"
                                        @click="deleteConstruction(selectedConstruction)">
                                        Delete construction</button>
                                </div>
                                <h2 class="mt-4">Groups</h2>
                                <select multiple="multiple"
                                    class="form-control select-style-extender"
                                    v-model="selectedGroup">
                                    <option v-for="(g, index) in groupsInClass" :key="index">
                                        {{ g.name }}
                                    </option>
                                </select>
                                <div class="mt-2">
                                    <div class="form-inline">
                                        <button class="btn btn-primary p-2 mr-1 mt-2"
                                            @click="send(selectedGroup)">
                                                Send view to one</button>
                                        <button class="btn btn-primary p-2 mr-1 mt-2"
                                            @click="sendToAll()">
                                                Send view to all</button>
                                        <button class="btn btn-primary p-2 mr-1 mt-2"
                                            @click="sendToFirstInGroup(selectedGroup)"
                                            :disabled="canDelete">
                                                Send to first Student</button>
                                    </div>
                                    <div class="form-inline checkbox mt-3">
                                        <label class="checkbox-container">
                                            Show menu bars
                                            <input type="checkbox">
                                            <span class="checkmark"></span>
                                        </label>
                                        <label class="checkbox-container">
                                            Send toolbar
                                            <input type="checkbox" v-model="sendToolbar">
                                            <span class="checkmark"></span>
                                        </label>
                                    </div>
                                </div>
                        </div>
                        <div class="offset-1 col-5">
                            <div class="col-10 class-table">
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
                                                    @click="selectGroupsInClass(cl.code)"
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
                    <form v-else @submit.prevent="addConstruction()">
                        <alert :alert="alert_add" />
                        <h3>Add Constructions</h3>
                        <div class="form-group">
                            <input
                                v-model="constructionName"
                                class="form-control"
                                type="text"
                                placeholder="Construction Name"
                                required>
                        </div>
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button class="btn btn-secondary"
                            @click.prevent="addMode = false">
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <ToolbarEditor v-model="toolbar"/>

    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import ToastrMixin from '@/mixins/ToastrMixin.vue';
import AlertMixin from '@/mixins/AlertMixin.vue';
import GeogebraInterface from '../../Geogebra/GeogebraInterface';
import freshGeogebraState from '../../../helpers/fresh_geogebra_state';
import ToolbarEditor from './ToolbarEditor.vue';

export default {
    name: 'Designer',

    data() {
        return {
            alert: undefined,
            alert_add: undefined,
            constructions: undefined,
            selectedConstruction: [],
            selectedGroup: [],
            addMode: false,
            constructionName: undefined,
            constructionXML: undefined,
            GI: undefined,
            classname: undefined,
            code: undefined,
            groupsInClass: undefined,
            toolbar: '',
            sendToolbar: false,
        };
    },

    mixins: [AlertMixin, ToastrMixin],

    components: {
        ToolbarEditor,
    },

    computed: {
        ...mapGetters('users', {
            teacher: 'current',
        }),

        ...mapGetters('constructions', {
            findConstruction: 'find',
        }),

        chosenConstruction() {
            return this.findConstruction({ query: { name: this.selectedConstruction[0] } });
        },

        ...mapGetters('groups', {
            findGroupsInStore: 'find',
        }),

        ...mapGetters('classes', {
            findClassesInStore: 'find',
            getClass: 'get',
        }),

        ...mapGetters('workshops', {
            getWorkshop: 'get',
        }),

        classes() {
            return this.findClassesInStore({
                query: { $sort: { code: 1 } },
            });
        },

        canDelete() {
            return !this.selectedGroup.length || !this.sendToolbar;
        },
    },

    methods: {
        ...mapActions('constructions', {
            findConstructions: 'find',
            createConstruction: 'create',
            removeConstruction: 'remove',
            get: 'get',
        }),

        ...mapActions('groups', {
            findGroups: 'find',
        }),

        ...mapActions('classes', {
            findClasses: 'find',
        }),

        ...mapActions('users', {
            patch: 'patch',
        }),

        ...mapActions('workshops', {
            getWorkshopToStore: 'get',
            createWorkshop: 'create',
            updateWorkshop: 'update',
            patchWorkshop: 'patch',
        }),

        ...mapActions('elements', {
            removeElement: 'remove',
            createElement: 'create',
        }),

        async selectGroupsInClass(code) {
            this.clearToast();

            this.code = code;

            this.groupsInClass = await this.findGroups({ query: { class: code } });

            if (!this.groupsInClass.length) {
                this.showToast('Selected class nas no groups', 'warning');
            }
        },

        async useConstruction() {
            try {
                await this.get(this.selectedConstruction).then((construction) => {
                    this.GI.setXML(construction.xml);
                    this.GI.registerGlobalListeners();
                    this.$log.debug('Got construction', construction);

                    if (construction.properties && construction.properties.perspectives) {
                        this.GI.setPerspective(construction.properties.perspectives);
                    }
                });
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: 'Please select construction',
                };
            }
        },

        dismissAlert() {
            this.alert = undefined;
            this.alert_add = undefined;
        },

        async deleteConstruction() {
            this.dismissAlert();

            try {
                await this.removeConstruction(this.selectedConstruction);

                this.selectedConstruction.forEach((construction) => {
                    this.teacher.constructions = this.teacher.constructions.filter(
                        con => con !== construction,
                    );
                });

                this.alert = {
                    type: 'success',
                    message: 'Construction deleted',
                };
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        async addConstruction() {
            this.dismissAlert();

            const xml = this.GI.getXML();

            try {
                await this.createConstruction({
                    name: this.constructionName,
                    xml,
                    properties: {
                        perspectives: this.extractPerspectives(xml),
                    },
                });

                this.$log.debug('Saving XML:', xml);

                this.addMode = false;

                this.alert = {
                    type: 'success',
                    message: 'Construction saved',
                };
            } catch (error) {
                this.alert_add = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        resetView() {
            this.GI.setXML(freshGeogebraState);
            this.GI.registerGlobalListeners();
        },

        async send(groups) {
            this.$log.debug('Send');

            const information = this.prepareMetaInformationPerspectivesAndToolbars();

            await this.findGroupsInStore({
                query: {
                    name: groups,
                    class: this.code,
                },
            });

            const groupsObjects = await this.findGroups({
                query: {
                    name: groups,
                    class: this.code,
                },
            });

            const properties = {
                perspectives: information.perspectives,
                toolbar: information.toolbar,
            };
            await this.sendConstructionToGroups(
                groupsObjects,
                information.metaInformation,
                properties,
            );
        },

        // Send selected toolbar and perspectives to first student in selected group/ groups.
        async sendToFirstInGroup(groups) {
            if (!groups.length) {
                this.showToast('Please select group to send toolbar for first student', 'warning');
            } else {
                const {
                    perspectives,
                    toolbar,
                } = this.prepareMetaInformationPerspectivesAndToolbars();

                const { class: code } = this;

                await this.findGroupsInStore({
                    query: {
                        name: groups,
                        class: this.code,
                    },
                });

                const groupsObjects = await this.findGroups({
                    query: {
                        name: groups,
                        class: code,
                    },
                });

                const properties = { perspectives, toolbar };

                groupsObjects.forEach(async (obj, i) => {
                    const { _id } = groupsObjects[i];

                    try {
                        await this.patchWorkshop([_id, {
                            propertiesFirst: properties,
                        }]);
                        this.showToast('Successfully send toolbar to first', 'success');
                    } catch (error) {
                        this.showToast('Error while sending toolbar', 'danger');
                    }
                });
            }
        },

        async sendToAll() {
            this.$log.debug('SendToAll');

            const information = this.prepareMetaInformationPerspectivesAndToolbars();

            await this.findGroupsInStore({ query: { class: this.code } });

            const groupsObjects = await this.findGroups({
                query: {
                    class: this.code,
                },
            });

            const properties = {
                perspectives: information.perspectives,
                toolbar: information.toolbar,
            };
            await this.sendConstructionToGroups(
                groupsObjects,
                information.metaInformation,
                properties,
            );
        },

        prepareMetaInformationPerspectivesAndToolbars() {
            const xml = this.GI.getXML();
            const metaInformation = this.produceXMLWithoutConstructionInside(xml);
            const perspectives = this.extractPerspectives(metaInformation);
            let toolbar = null;

            this.$log.debug('this.perspectivesThatHaveToolbar(perspectives)', this.perspectivesThatHaveToolbar(perspectives));

            if (this.sendToolbar && this.perspectivesThatHaveToolbar(perspectives)) {
                // eslint-disable-next-line prefer-destructuring
                toolbar = this.toolbar;
                this.$log.debug('Sending toolbar', toolbar);
            }

            this.$log.debug('perspectives', perspectives);
            this.$log.debug('toolbar', toolbar);

            return { metaInformation, perspectives, toolbar };
        },

        async sendConstructionToGroups(groupsObjects, metaInformation, properties) {
            let successes = 0;
            const results = [];

            this.$log.debug('GroupsObjects', groupsObjects);

            for (let i = 0; i < groupsObjects.length; i += 1) {
                const g = groupsObjects[i];
                const result = await this.createOrUpdateWorkshopWithElementsXMLAndProperties(
                    g._id,
                    metaInformation,
                    properties,
                );
                results.push(result);
            }

            successes = results.reduce((x, y) => x + y);


            this.showToast(`Successfully send construction to ${successes}
            groups out of ${groupsObjects.length} selected`, ((successes === groupsObjects.length) ? 'success' : 'warning'));
        },

        async createOrUpdateWorkshopWithElementsXMLAndProperties(
            groupId,
            metaInformation,
            properties,
        ) {
            this.$log.debug(groupId);
            try {
                await this.createWorkshop({ id: groupId, xml: metaInformation, properties });

                await this.addElements(groupId);

                return 1;
            } catch (error) {
                let correct = 0;

                if (error.code === 400) {
                    this.$log.debug('error code 400 ', error.message);

                    await this.updateWorkshop([groupId, { updating: true }]);

                    await this.removeThenAddElements(groupId);

                    await this.updateWorkshop([groupId, {
                        updating: false,
                        xml: metaInformation,
                        properties,
                    }]);

                    correct = 1;
                } else {
                    this.showToast('Error while creating/updating workshop', 'warning');
                    console.log(error.message);
                }
                return correct;
            }
        },

        getElementId(groupId, label) {
            return `${groupId}-${label}`;
        },

        async addElements(groupId) {
            for (let i = 0; i < this.GI.applet.getObjectNumber(); i += 1) {
                const label = this.GI.applet.getObjectName(i);

                await this.createElement({
                    id: this.getElementId(groupId, label),
                    name: label,
                    owner: null,
                    workshop: groupId,
                    xml: this.GI.applet.getXML(label),
                    obj_cmd_str: this.GI.applet.getCommandString(label, false),
                });
                this.$log.debug('createdElement', label);
            }
        },

        async removeThenAddElements(groupId) {
            this.$log.debug('groupId', groupId);

            await this.removeElement([null, {
                query: {
                    workshop: groupId,
                },
            }]);
            this.$log.debug('groupId', groupId);

            await this.addElements(groupId);
        },

        /*
            This function takes xml with construction and removes construction
            inside so that there are no elements present in the XML.
            Elements are loaded to workshops through service('elements').
        */
        produceXMLWithoutConstructionInside(xml) {
            const parser = new DOMParser();

            const xmlDoc = parser.parseFromString(xml, 'text/xml');
            const construction = xmlDoc.getElementsByTagName('construction')[0];

            xmlDoc.documentElement.removeChild(construction);
            this.$log.debug(xmlDoc);

            return new XMLSerializer().serializeToString(xmlDoc);
        },

        extractPerspectives(xml) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');

            const visibleViews = Array.from(xmlDoc.getElementsByTagName('view'))
                .filter(el => el.getAttribute('visible') === 'true');

            // We sort the views so that we can later send the ordered
            // arrangement of the different view tabs present
            // in the activity designer to the students' views
            const visibleViewsSorted = visibleViews.sort((a, b) => {
                const aOrder = a.getAttribute('location').replace(/,/g, '');
                const bOrder = b.getAttribute('location').replace(/,/g, '');

                if (aOrder > bOrder) {
                    return -1;
                }
                if (bOrder > aOrder) {
                    return 1;
                }

                return 0;
            });
            // The following loop creates a string of the (encoded)
            // values of the different views present in the
            // activity designer (to be sent to the students)
            let perspectivesMapped = '';

            for (let i = 0; i < visibleViewsSorted.length; i += 1) {
                const id = visibleViewsSorted[i].getAttribute('id');


                /* This mapping between integers and letters is taken from
                 * old Mathnet project. Integers are coded inside XML in <view> elements
                 */
                if (id === '1') {
                    perspectivesMapped += 'G';
                } else if (id === '2') {
                    perspectivesMapped += 'A';
                } else if (id === '4') {
                    perspectivesMapped += 'S';
                } else if (id === '8') {
                    perspectivesMapped += 'C';
                } else if (id === '16') {
                    perspectivesMapped += 'D';
                } else if (id === '32') {
                    perspectivesMapped += 'L';
                } else if (id === '64') {
                    perspectivesMapped += 'B';
                } else if (id === '512') {
                    perspectivesMapped += 'T';
                }
                /*
                else if (id == '128') {
                }
                else if (id == '512') {
                }
                else if (id == '4097') {
                }
                else if (id == '43') {
                }
                else if (id == '70') {
                }
                */
            }
            return perspectivesMapped;
        },

        perspectivesThatHaveToolbar(perspectives) {
            return !(perspectives.includes('S') || perspectives.includes('C')
            || perspectives.includes('L') || perspectives.includes('B')
            || perspectives.includes('T'));
        },
    },

    mounted() {
        const params = {
            container: 'geogebra_designer',
            id: 'applet',
            width: this.$refs.geogebra_container.clientWidth - 30,
            log: this.$log,
        };

        // simple example code to show how to initialize GeoGebra
        this.GI = new GeogebraInterface(params); // constructor

        this.GI.inject(() => { // passing callback
            // const xml = this.GI.getXML(); // getting Geogebra state
            // this.GI.setXML(xml); // setting Geogebra state from xml
        });
    },

    created() {
        this.findConstructions();
        this.findClasses();
    },

    watch: {
        editMode(addValue) {
            if (!addValue) {
                this.constructionName = undefined;
                this.xml = undefined;
            }
        },
    },
};
</script>
