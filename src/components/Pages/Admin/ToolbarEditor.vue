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
                        <alert :alert="generalAlert" />
                        <div class="col-6">
                            <select multiple="multiple"
                                class="form-control select-extender"
                                v-model="selectedToolbar">
                                <option v-for="t in toolbars" :value="t.name" :key="t.name">
                                    {{ t.name }}
                                </option>
                            </select>
                            <div class="form-inline mt-3">
                                <button class="btn btn-primary p-2 mr-1 mt-2"
                                    @click="useToolbar(selectedToolbar)">
                                    Use Toolbar</button>
                                <button class="btn btn-primary p-2 mr-1 mt-2"
                                    @click="addMode = true">
                                    Add Toolbar</button>
                                <button class="btn btn-danger p-2 mr-1 mt-2"
                                    @click="deleteToolbar(selectedToolbar)">
                                    Delete Toolbar</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12" v-else>
                        <form @submit.prevent="addToolbar()">
                            <alert :alert="alertAdd" />
                            <h3>Add Toolbar</h3>
                            <div class="form-group">
                                <input
                                    v-model="toolbarName"
                                    class="form-control"
                                    type="text"
                                    placeholder="Toolbar Name"
                                    required>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                Save Toolbar</button>
                            <button class="btn btn-secondary"
                                @click.prevent="addMode = false">
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
                                        :group="{ name: 'icons', pull: 'clone', put: false }"
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
                                         <draggable v-for="(list, index) in lists"
                                            class="dragArea draggable-list"
                                            :list="list"
                                            group="icons"
                                            draggable=".item"
                                            :key="index"
                                          >
                                            <div
                                              class="item tool-icon"
                                              v-for="(element, index2) in list"
                                              :key="element.mode"
                                            >
                                                <img :src="element.src" :title="element.name"/>
                                                <button class="tool-delete-button"
                                                    @click="deleteTool(index,index2)">-</button>
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
import icons from '../../../helpers/icons';


function generateClearedArrays() {
    return Array.from(new Array(12), () => []);
}

export default {
    components: {
        draggable,
    },

    props: {
        value: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            lists: generateClearedArrays(),
            content: this.value,
            selectedToolbar: [],
            icons,
            addMode: false,
            generalAlert: undefined,
            alertAdd: undefined,
            toolbarName: undefined,
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
    },

    methods: {
        ...mapActions('users', {
            patchUser: 'patch',
        }),

        handleChange() {
            this.content = this.transformArrayToolbarToString();
            this.$emit('input', this.content);

            this.$log.debug('this.content', this.content);
        },

        deleteTool(x, y) {
            this.lists[x].splice(y, 1);
        },

        dismissAlert() {
            this.generalAlert = undefined;
            this.alertAdd = undefined;
        },

        transformArrayToolbarToString() {
            let string = '';

            const strings = this.lists.map(list => list.map(item => item.mode).join(' '));
            string = strings.join('|');

            return string;
        },

        transformStringToArrayToolbar(string) {
            let lists = string.split('|');

            lists = lists.map(list => list.split(' '));

            lists = lists.map(list => list.filter(item => (item !== '' && item !== undefined && item !== null))
                .map(toolNum => this.icons.find(ticon => ticon.mode === parseInt(toolNum, 10))));

            return lists;
        },

        async addToolbar() {
            this.dismissAlert();

            this.$log.debug(this.teacher);

            // eslint-disable-next-line no-restricted-globals
            if (this.toolbarName) {
                if (this.toolbars !== undefined) {
                    const idx = this.toolbars.findIndex(t => t.name === this.toolbarName);

                    if (idx !== -1) {
                        // eslint-disable-next-line no-undef
                        this.alertAdd = {
                            type: 'danger',
                            message: 'Toolbar with such name exists. Cancelling overwrite.',
                        };
                        return;
                    }
                }

                const toolbar = { name: this.toolbarName, tools: this.content };

                try {
                    if (this.toolbars !== undefined) {
                        await this.patchUser(
                            [this.teacher.username, {
                                toolbars: [...this.toolbars, toolbar],
                            },
                            ],
                        );
                    } else {
                        await this.patchUser(
                            [this.teacher.username, {
                                toolbars: [toolbar],
                            },
                            ],
                        );
                    }

                    this.addMode = false;

                    this.generalAlert = {
                        type: 'success',
                        message: 'Construction saved',
                    };
                } catch (error) {
                    this.alertAdd = {
                        type: 'danger',
                        message: error.message,
                    };
                }
            }

            this.$log.debug('Teacher after', this.teacher);
        },

        clearToolbar() {
            this.lists = generateClearedArrays();
        },

        useToolbar(selectedToolbar) {
            if (selectedToolbar.length > 0) {
                this.$log.debug(selectedToolbar);

                let { toolbars } = this.teacher;

                toolbars = toolbars.filter(
                    t => selectedToolbar.includes(t.name),
                );

                const toolbar = toolbars[0];
                this.$log.debug('The toolbar is', toolbar);

                this.lists = this.transformStringToArrayToolbar(toolbar.tools);
            }
        },

        async deleteToolbar(selectedToolbar) {
            if (selectedToolbar.length > 0) {
                this.$log.debug(selectedToolbar);

                let { toolbars } = this.teacher;

                this.selectedToolbar.forEach((selected) => {
                    toolbars = toolbars.filter(
                        t => t.name !== selected,
                    );
                });

                this.selectedToolbar = [];

                this.$log.debug('toolbars after filter', toolbars);

                await this.patchUser([this.teacher.username, { toolbars }]);
            }
        },
    },

    watch: {
        editMode(addValue) {
            if (!addValue) {
                this.toolbarName = undefined;
                this.toolbarToSave = undefined;
            }
        },

        lists() {
            this.handleChange();
        },
    },
};
</script>
