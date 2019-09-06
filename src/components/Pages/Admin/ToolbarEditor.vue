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
                        <alert :alert="alertVuex" />
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
                                    @click="addToolbar">
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
                            <alert :alert="alertVuex" />
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
                                @click.prevent="closeToolbar">
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
                                        :group="{ name: 'icons', pull: 'clone',
                                            put: false, sort: false }"
                                      >
                                        <div
                                          class="list-group-item available-tool-icon"
                                          v-for="element in icons"
                                          :key="element.mode"
                                        >
                                          <img :src="element.src" :title="element.name"/>
                                        </div>
                                     </draggable>


                                     <div class="draggable-lists-container">
                                         <draggable v-for="(list, listNumber) in currentToolbar"
                                            class="dragArea draggable-list"
                                            :list="list"
                                            group="icons"
                                            draggable=".item"
                                            :key="listNumber"
                                          >
                                            <div
                                              class="item tool-icon"
                                              v-for="(element, elementNumber) in list"
                                              :key="elementNumber"
                                            >
                                                <img :src="element.src" :title="element.name"/>
                                                <button class="tool-delete-button"
                                                    @click="deleteTool(listNumber, elementNumber)">
                                                    -</button>
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
import { mapState, mapGetters, mapActions } from 'vuex';
import draggable from 'vuedraggable';
import AlertMixin from '@/mixins/AlertMixin.vue';

// function parseTools(list) {
//     return list.split(' ').filter(s => s).map(s => icons.find(({ mode }) => s === mode));
// }

// function parseToolbar(toolbarString) {
//     return toolbarString.split('|').map(parseTools);
// }

// function stringifyTools(list) {
//     return list.map(({ mode }) => mode).join(' ');
// }
//
// function stringifyToolbar(toolbar) {
//     return toolbar.map(stringifyTools).join('|');
// }

export default {
    components: {
        draggable,
    },

    mixins: [AlertMixin],

    computed: {
        ...mapGetters('users', {
            teacher: 'current',
        }),

        ...mapGetters('toolbarEditor', [
            'icons',
            'canDelete',
            'addMode',
            'toolbars',
            'selectedToolbars',
        ]),

        ...mapGetters('toolbarEditor', {
            getToolbarName: 'addToolbarName',
            getSelectedToolbars: 'selectedToolbars',
        }),

        ...mapState('toolbarEditor', [
            'currentToolbar',
            // 'alert',
        ]),

        ...mapState('toolbarEditor', {
            alertVuex: 'alert',
        }),

        addToolbarName: {
            set(value) {
                this.setToolbarName(value);
            },
            get() {
                return this.getToolbarName;
            },
        },

        selectedToolbars: {
            set(value) {
                this.setSelectedToolbars(value);
            },
            get() {
                return this.getSelectedToolbars;
            },
        },
    },

    methods: {
        ...mapActions('toolbarEditor', [
            'useToolbar',
            'addToolbar',
            'saveToolbar',
            'sendToolbars',
            'deleteToolbar',
            'deleteTool',
            'closeToolbar',
            'clearToolbar',
            'setToolbarName',
            'setSelectedToolbars',
        ]),
    },

    watch: {
        // addMode(newValue) {
        //     if (newValue) this.addToolbarName = null;
        // },
        //
        // toolbarString(newValue) {
        //     this.$emit('input', newValue);
        // },
    },

    created() {
    },
};
</script>
