<template>
    <div class="ibox border-bottom col-md-12 col-lg-12">
        <div class="ibox-title">
            <h5>Customize Toolbars</h5>
        </div>
        <div class="ibox-content table-responsive ibox-style-extender">
            <div class="row">
                <div>
                    <div v-if="!addMode">
                        <div class="col-12">
                            <h2>Toolbars</h2>
                        </div>
                        <alert :alert="alert" />
                        <div class="col-6">
                            <select multiple="multiple"
                                class="form-control select-extender"
                                v-model="selectedToolbars">
                                <option v-for="t in toolbars" :value="t.name" :key="t.name">
                                    {{ t.name }}
                                </option>
                            </select>
                            <div class="form-inline mt-3">
                                <button class="btn btn-primary p-2 mr-1 mt-2"
                                    @click="useToolbar">
                                    Use Toolbar</button>
                                <button class="btn btn-primary p-2 mr-1 mt-2"
                                    @click="onAddToolbar">
                                    Add Toolbar</button>
                                <button class="btn btn-danger p-2 mr-1 mt-2"
                                    @click="deleteToolbar"
                                    :disabled="!canDelete">
                                    Delete Toolbar</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12" v-else>
                        <form>
                            <alert :alert="alert" />
                            <h3>Add Toolbar</h3>
                            <div class="form-group">
                                <input
                                    v-model="addToolbarName"
                                    class="form-control"
                                    type="text"
                                    placeholder="Toolbar Name"
                                    required>
                            </div>
                            <button class="btn btn-primary"
                                @click.prevent="saveToolbar">
                                Save Toolbar</button>
                            <button class="btn btn-secondary"
                                @click.prevent="onCloseToolbar">
                                Cancel
                            </button>
                        </form>
                    </div>
                    <div class="col-12 mt-2">
                        <div class="toolbar-options">
                            <h2 class="mt-3">Toolbar</h2>
                            <div class="toolbar-show">

                                <div class="col-10">
                                    <draggable
                                        class="dragArea list-of-draggable-tools"
                                        :list="icons"
                                        :group="{ name: 'icons', pull: 'clone', put: false }">
                                        <div
                                            class="list-group-item available-tool-icon"
                                            v-for="element in icons"
                                            :key="element.mode">
                                          <img :src="element.src" :title="element.name"/>
                                        </div>
                                     </draggable>

                                     <div class="draggable-lists-container">
                                         <draggable v-for="(list, listNumber) in currentToolbar"
                                            class="dragArea draggable-list"
                                            :list="list"
                                            group="icons"
                                            draggable=".item"
                                            :key="listNumber">
                                            <div
                                                class="item tool-icon"
                                                v-for="(element, elementNumber) in list"
                                                :key="elementNumber">
                                                <img :src="element.src" :title="element.name"/>
                                                <button
                                                    class="tool-delete-button"
                                                    @click="deleteTool(listNumber, elementNumber)">
                                                    -
                                                </button>
                                            </div>
                                          </draggable>
                                    </div>
                                  </div>
                            </div>
                            <div class="toolbar-show-options">
                                <button class="btn btn-danger" @click="clearToolbar">
                                    <i class="fa fa-trash text-light"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                <div>
            </div>
        </div>
     </div>
     </div>
     </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import draggable from 'vuedraggable';
import AlertMixin from '@/mixins/AlertMixin.vue';

/*
 * Icons represent various GeoGebra tools, which have 'mode'
 * that distinguishes them in GeoGebra. They also have names shown on hover,
 * and 'src' that links appropriate svg icon image.
 */
import icons from '../../../helpers/icons';
import emptyToolbarString from '../../../helpers/emptyToolbarString';

/*
 * General commentary:
 * In this component there are methods for editing/saving/loading
 * toolbars. Toolbars may be represented in dual forms: as a string
 * e.g. "1 2 3 | 4 5 6 | ... " or 2-dimensional array of arrays.
 * First representation uses '|' to divide toolbar into lists,
 * and each list between '|' signs has numbers representing
 * dropdown menu with many buttons. In array form each array represents
 * one dropdown list, each of list elements represents different button
 * with a mode number, icon image and name. Mode numbers represent
 * different tools in Geogebra.
 */

/*
 *  Empty toolbar produces standard,
 *  12-element array full of empty arrays
 *  Why 12 elements? It's standard taken from old MathNet
 */
function emptyToolbar() {
    return Array.from(new Array(12), () => []);
}

/*
 * Parse tools takes part of original toolbar, a part splitted by '|' symbols,
 * then splits it by spaces, filters if they are non-empty and maps into icons,
 * finding icon that is matched by icon mode.
 */
function parseTools(list) {
    return list.split(' ').filter(s => s).map(s => icons.find(({ mode }) => s === mode));
}

/*
 * Parse toolbar decomposes toolbar in string form
 * into array of arrays (2-dimensional), through use of parseTools
 */
function parseToolbar(toolbarString) {
    if (toolbarString) return toolbarString.split('|').map(parseTools);
    else return emptyToolbar();
}

/*
 * Transforms array into a string of tools
 * (for one list, a part of the whole toolbar),
 * joins with spaces
 */
function stringifyTools(list) {
    if (list) return list.filter(t => t).map(({ mode }) => mode).join(' ');
    else return '';
}

/*
 * Transforms an array of arrays into a string form of toolbar,
 * joins fragments of a whole toolbar string with '|' sign.
 */
function stringifyToolbar(toolbar) {
    return toolbar.map(stringifyTools).join('|');
}

export default {
    components: {
        draggable,
    },

    /*
     * Value prop used for a 2-way binding of v-model of ToolbarEditor
     */
    props: {
        value: {
            type: String,
            default: null,
        },
    },

    data() {
        return {
            // Toolbars selected in a multi-select (e.g. to be deleted or used)
            selectedToolbars: [],
            // Current toolbar in an array of arrays representation
            currentToolbar: emptyToolbar(),
            // Flag representing if addToolbar form is opened
            addMode: false,
            // Name of a toolbar that is to be added
            addToolbarName: null,
        };
    },

    mixins: [AlertMixin],

    computed: {
        ...mapGetters('users', {
            teacher: 'current',
        }),

        toolbars() {
            return this.teacher.toolbars;
        },

        icons() {
            return icons;
        },

        canDelete() {
            return this.selectedToolbars.length > 0;
        },

        toolbarString() {
            return stringifyToolbar(this.currentToolbar);
        },
    },

    methods: {
        ...mapActions('users', {
            patchUser: 'patch',
        }),

        /*
         * Uses selectedToolbar by loading it into currentToolbar
         */
        useToolbar() {
            if (this.selectedToolbars.length > 0) {
                const selectedName = this.selectedToolbars[0];

                const toolbar = this.toolbars.find(({ name }) => name === selectedName);

                if (toolbar) {
                    this.currentToolbar = parseToolbar(toolbar.tools);
                }
            }
        },

        clearToolbar() {
            this.currentToolbar = emptyToolbar();
        },

        /*
         * Deletes one tool from a toolbar with coordinates given by
         * listNumber, elementNumber.
         * To sustain Vue's reactivity, you cannot just edit
         * this.currentToolbar, you have to copy it and splice
         * then update currentToolbar. Otherwise reactivity is lost.
         */
        deleteTool(listNumber, elementNumber) {
            const toolbar = [...this.currentToolbar];
            const list = toolbar[listNumber];
            list.splice(elementNumber, 1);
            toolbar[listNumber] = list;
            this.currentToolbar = toolbar;
        },

        /*
         * Used to open add-form
         */
        onAddToolbar() {
            this.addMode = true;
        },

        /*
         * Saves toolbar with given name this.addToolbarName
         * if there is no overwrite conflict
         */
        async saveToolbar() {
            this.alert = null;

            if (this.toolbars && this.toolbars.find(({ name }) => name === this.addToolbarName)) {
                this.alert = {
                    type: 'danger',
                    message: 'Toolbar with this name already exists. Cancelling overwrite.',
                };
                return;
            }

            const toolbar = {
                name: this.addToolbarName,
                tools: this.toolbarString,
            };

            try {
                await this.sendToolbars([...(this.toolbars || []), toolbar]);
            } catch ({ message }) {
                this.showError(message);
            }

            this.onCloseToolbar();
        },

        /*
         * Deletes selected toolbar(s)
         */
        async deleteToolbar() {
            const list = this.toolbars.filter(
                ({ name }) => !this.selectedToolbars.includes(name),
            );

            try {
                await this.sendToolbars(list);
            } catch ({ message }) {
                this.showError(message);
            }
        },

        /*
         * Closes toolbar add form
         */
        onCloseToolbar() {
            this.addMode = false;
        },

        /*
         * Updates toolbar data by sending with patchUser method
         */
        async sendToolbars(toolbars) {
            await this.patchUser([
                this.teacher.username, {
                    toolbars,
                },
            ]);
        },

        showError(message) {
            this.alert = { type: 'danger', message };
        },

        getToolbarItemName(username) {
            this.$log.debug('Toolbar for username', username);
            return `toolbar-${username}`;
        },

        saveToolbarStateToLocalStorage() {
            this.$log.debug('Saving Toolbar');
            window.localStorage.setItem(
                this.getToolbarItemName(this.teacher.username),
                this.toolbarString,
            );
        },
    },

    watch: {
        addMode(newValue) {
            if (newValue) this.addToolbarName = null;
        },

        /*
         * Needed by v-model 2-way binding to update state
         */
        toolbarString(newValue) {
            this.$emit('input', newValue);

            this.saveToolbarStateToLocalStorage();
        },

        /*
         * Reacts to updates of prop named 'value',
         * parsing incoming toolbar string
         */
        value(newValue, oldValue) {
            if (newValue !== oldValue && newValue !== emptyToolbarString()) {
                this.currentToolbar = parseToolbar(newValue);
            }
        },
    },
};
</script>
