<template>
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
                        <div class="col-12">
                            <div class="col-12">
                                <draggable
                                    class="dragArea list-of-draggable-tools"
                                    :list="availableTools"
                                    :group="{ name: 'people', pull: 'clone', put: false }"
                                    @change="handleChange"
                                  >
                                    <div
                                      class="list-group-item available-tool-icon"
                                      v-for="element in availableTools"
                                      :key="element.name"
                                    >
                                      {{ element.name }}
                                    </div>
                                 </draggable>


                                 <div class="draggable-lists-container">
                                     <draggable v-for="(list, index) in lists"
                                        class="dragArea draggable-list"
                                        :list="list"
                                        group="people"
                                        draggable=".item"
                                        @change="handleChange"
                                        :key="index"
                                      >
                                        <div
                                          class="item tool-icon"
                                          v-for="(element, index2) in list"
                                          :key="element.id"
                                        >
                                          {{ element.name }}
                                          <button class="tool-delete-button"
                                          @click="deleteTool(index,index2)">-</button>
                                        </div>
                                      </draggable>
                                </div>

                                <button @click="transformArrayToolbarToString">
                                    Test
                                </button>
                              </div>
                        </div>
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
                            <!-- <1!--Toolbar show bar--1> -->
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
                        <!-- <div class="checkbox form-inline mt-4">
                            <label class="checkbox-container">
                                Axis display
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
                        </div> -->
                        <div class="row">
                            <div class="col-6 mt-2">
                                <select class="form-control select-extender">
                                    <option value="option1">option1</option>
                                    <option value="option2">option2</option>
                                </select>
                            </div>
                        </div>
                        <!-- <div class="row mt-4">
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
                        </div> -->
                    </div>
                    <!-- <div class="row">
                        <div class="col-5">
                            <h2>Class users</h2>
                            <select multiple="multiple"
                                class="form-control select-extender">
                            </select>
                            <button class="btn btn-primary mt-3">Send</button>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>
     </div>
</template>

<script>
import draggable from 'vuedraggable';

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
            availableTools: this.generateDummyToolbarOptions(),
            lists: [
                [
                    { name: 0, id: 0 },
                    { name: 1, id: 1 },
                    { name: 2, id: 2 },
                ],
                [
                    { name: 3, id: 3 },
                    { name: 4, id: 4 },
                    { name: 5, id: 5 },
                ],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
            ],
            content: this.value,
        };
    },

    methods: {
        handleChange() {
            this.content = this.transformArrayToolbarToString();
            this.$emit('input', this.content);

            this.$log.debug('this.content', this.content);
        },

        deleteTool(x, y) {
            this.lists[x].splice(y, 1);

            this.content = this.transformArrayToolbarToString();
            this.$emit('input', this.content);

            this.$log.debug('this.content', this.content);
        },

        generateDummyToolbarOptions() {
            const array = [];
            for (let i = 0; i < 60; i += 1) {
                array[i] = { id: i, name: i };
            }
            return array;
        },

        transformArrayToolbarToString() {
            let string = '';

            for (let i = 0; i < this.lists.length; i += 1) {
                if (this.lists[i].length === 0 && (i !== (this.lists.length - 1))) string += '| ';
                for (let j = 0; j < this.lists[i].length; j += 1) {
                    if (this.lists[i][j].id) string += `${this.lists[i][j].id} `;

                    if (j === (this.lists[i].length - 1)) {
                        if (i !== (this.lists.length - 1)) string += '| ';
                    }
                }
            }

            this.$log.debug('Toolbar string is', string);
            return string;
        },
    },
};
</script>
