<template>
    <div class="designer">
        <div class="row">
            <div class="offset-md-1 col-md-10 offset-lg-2 col-lg-8">
                <h1 class="ml-2">Geogebra Designer</h1>
            </div>
        </div>
        <div class="wrapper wrapper-content">
            <div class="ibox border-bottom offset-md-1 col-md-10
                offset-lg-2 col-lg-8">
                <div class="ibox-title">
                    <h5>Designer</h5>
                </div>
                <div class="ibox-content table-responsive ibox-style-extender">
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
                    <div class="row" v-if="!addMode">
                        <div class="col-6">
                            <div class="col-10">
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
                            </div>
                            <div class="form-inline mt-2 col-12">
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
                            <div class="col-10 mt-4">
                                <h2>Groups</h2>
                                <select multiple="multiple"
                                    class="form-control select-style-extender">
                                    <option v-for="(g, index) in groupsInClass" :key="index">
                                        {{ g.name }}
                                    </option>
                                </select>
                                <div class="mt-2">
                                    <div class="form-inline">
                                        <button class="btn btn-primary p-2 mr-1 mt-2">
                                            Send view to one</button>
                                        <button class="btn btn-primary p-2 mr-1 mt-2">
                                            Send view to all</button>
                                    </div>
                                    <div class="checkbox mt-3">
                                        <label class="checkbox-container">
                                            Show menu bars
                                            <input type="checkbox">
                                            <span class="checkmark"></span>
                                        </label>
                                        <label class="checkbox-container">
                                            Send toolbar
                                            <input type="checkbox">
                                            <span class="checkmark"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="offset-1 col-5">
                            <div class="col-10 class-table">
                                <h2>Select class</h2>
                                <table class="table">
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
                                                <button @click="selectGroupsInClass(cl.code)"
                                                    class="btn btn-sm btn-primary mr-2">
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="col-6">

                        </div>
                    </div>
                    <form v-else @submit.prevent="addConstruction()">
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
                    <div class="row mt-4">
                        <div class="col-10 geogebra-applet">
                            <h2 class="mb-3">Geogebra applet</h2>
                            <button class="btn btn-warning reset-btn p-2 mb-3" @click="resetView">
                                Reset view
                            </button>
                            <div id="geogebra_designer">
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ibox border-bottom offset-md-1 col-md-10
                offset-lg-2 col-lg-8">
            <div class="ibox-title">
                <h5>Customize Toolbars</h5>
            </div>
            <div class="ibox-content table-responsive ibox-style-extender">
                <div class="row">
                    <div class="col-12">
                        <h2>Toolbars</h2>
                        <div class="geogebra-tools mt-3">
                            <!--toolbar from geogebra-->
                        </div>
                    </div>
                        <div class="col-6">
                            <select multiple="multiple"
                                class="form-control select-extender">
                                <option value="option1">option1</option>
                                <option value="option2">option2</option>
                            </select>
                            <div class="form-inline mt-3">
                                <button class="btn btn-primary p-2 mr-1 mt-2">
                                    Use Toolbar</button>
                                <button class="btn btn-danger p-2 mr-1 mt-2">
                                    Delete Toolbar</button>
                            </div>
                        </div>
                    <div class="col-12 mt-2">
                        <div class="toolbar-options">
                            <h2 class="mt-3">Toolbar</h2>
                            <div class="toolbar-show">
                                <!--Toolbar show bar-->
                                <div class="toolbar-show-options">
                                    <button class="btn btn-primary">
                                        <i class="fa fa-download text-light"></i>
                                    </button>
                                    <button class="btn btn-danger">
                                        <i class="fa fa-trash text-light"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="position-options">
                            <div class="checkbox form-inline mt-4">
                                <label class="checkbox-container">
                                    Axis dispaly
                                     <input type="checkbox">
                                    <span class="checkmark"></span>
                                </label>
                                <label class="checkbox-container">
                                    Grid display
                                     <input type="checkbox">
                                    <span class="checkmark"></span>
                                </label>
                                <label class="checkbox-container">
                                    Manual perspective
                                     <input type="checkbox">
                                    <span class="checkmark"></span>
                                </label>
                            </div>
                            <div class="row">
                                <div class="col-6 mt-2">
                                    <select class="form-control select-extender">
                                        <option value="option1">option1</option>
                                        <option value="option2">option2</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mt-4">
                                <div class="col-12">
                                    <h2>Window Dimensions</h2>
                                </div>
                                <div class="col-6">
                                    <div class="x-dimension form-group">
                                        <label class="font-weight-bold mt-2">
                                            X-max</label>
                                        <input type="number" placeholder="Enter X size"
                                            class="form-control"/>
                                        <label class="font-weight-bold mt-2">
                                            X-min</label>
                                        <input type="number" placeholder="Enter X size"
                                            class="form-control"/>
                                    </div>
                                    <label class="checkbox-container">
                                        Use the above settings for Graphics 2
                                        <input type="checkbox">
                                        <span class="checkmark"></span>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <div class="y-dimension form-group">
                                        <label class="font-weight-bold mt-2">
                                            Y-max </label>
                                        <input type="number" placeholder="Enter Y size"
                                            class="form-control"/>
                                        <label class="font-weight-bold mt-2">
                                            Y-min</label>
                                        <input type="number" placeholder="Enter Y size"
                                            class="form-control"/>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <h2>Axis steps</h2>
                                    <div class="form-group form-inline step-size">
                                        <div class="mr-3">
                                            <label class="font-weight-bold mt-2 axis-label">
                                                X-axis</label>
                                            <input type="number" placeholder="Enter X-axis"
                                                class="form-control pr-2"/>
                                        </div>
                                        <div class="mr-3">
                                            <label class="font-weight-bold mt-2 axis-label">
                                                Y-axis</label>
                                            <input type="number" placeholder="Enter Y-axis"
                                                class="form-control pr-2"/>
                                        </div>
                                        <div>
                                            <label class="font-weight-bold mt-2 axis-label">
                                                Z-axis</label>
                                            <input type="number" placeholder="Enter Z-axis"
                                                class="form-control pr-2"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-5">
                                <h2>Class users</h2>
                                <select multiple="multiple"
                                    class="form-control select-extender">
                                </select>
                                <button class="btn btn-primary mt-3">Send</button>
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
import GeogebraInterface from '../../Geogebra/GeogebraInterface';
import freshGeogebraState from '../../../helpers/fresh_geogebra_state';

export default {
    name: 'Designer',

    data() {
        return {
            alert: undefined,
            constructions: undefined,
            selectedConstruction: [],
            addMode: false,
            constructionName: undefined,
            constructionXML: undefined,
            GI: undefined,
            classname: undefined,
            code: undefined,
            groupsInClass: undefined,
        };
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

        classes() {
            return this.findClassesInStore({
                query: { $sort: { code: 1 } },
            });
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

        async selectGroupsInClass(code) {
            this.groupsInClass = await this.findGroups({ query: { class: code } });
        },

        async useConstruction() {
            await this.get(this.selectedConstruction).then((res) => {
                this.GI.setXML(res.xml);
            });
        },

        dismissAlert() {
            this.alert = undefined;
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
                    type: 'sucess',
                    message: 'Construction Deleted',
                };
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        async addConstruction() {
            try {
                await this.createConstruction({
                    name: this.constructionName,
                    xml: this.GI.getXML(),
                });
                this.addMode = false;
                this.teacher.constructions = [...this.teacher.constructions, this.constructionName];
            } catch (error) {
                this.alert = {
                    type: 'danger',
                    message: error.message,
                };
            }
        },

        resetView() {
            this.GI.setXML(freshGeogebraState);
        },
    },

    mounted() {
        const params = {
            container: 'geogebra_designer',
            id: 'applet',
            width: 800,
            height: 600,
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
