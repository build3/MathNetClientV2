<template>
    <div class="ibox border-bottom col-md-12 col-lg-12">
        <div class="ibox-title">
            <h5>Customize Toolbars</h5>
        </div>
        <div class="ibox-content table-responsive ibox-style-extender">
            <div class="row">
                <div class="col-12">
                    <h2>Toolbars</h2>
                    <div class="geogebra-tools mt-3">
                        <div class="col-12">

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

                            <div class="col-10">
                                <draggable
                                    class="dragArea list-of-draggable-tools"
                                    :list="availableTools"
                                    :group="{ name: 'icons', pull: 'clone', put: false }"
                                    @change="handleChange"
                                  >
                                    <div
                                      class="list-group-item available-tool-icon"
                                      v-for="element in availableTools"
                                      :key="element.mode"
                                    >
                                      <img :src="element.src"/>
                                    </div>
                                 </draggable>


                                 <div class="draggable-lists-container">
                                     <draggable v-for="(list, index) in lists"
                                        class="dragArea draggable-list"
                                        :list="list"
                                        group="icons"
                                        draggable=".item"
                                        @change="handleChange"
                                        :key="index"
                                      >
                                        <div
                                          class="item tool-icon"
                                          v-for="(element, index2) in list"
                                          :key="element.mode"
                                        >
                                            <img :src="element.src"/>
                                            <button class="tool-delete-button"
                                                @click="deleteTool(index,index2)">-</button>
                                        </div>
                                      </draggable>
                                </div>
                              </div>
                        </div>
                        <div class="toolbar-show-options">
                            <button class="btn btn-primary">
                                <i class="fa fa-download text-light"></i>
                            </button>
                            <button class="btn btn-danger">
                                <i class="fa fa-trash text-light"></i>
                            </button>
                        </div>
                    </div>
                    <!-- <div class="position-options"> -->
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
                        <!-- <div class="row">
                            <div class="col-6 mt-2">
                                <select class="form-control select-extender">
                                    <option value="option1">option1</option>
                                    <option value="option2">option2</option>
                                </select>
                            </div>
                        </div> -->
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
                    <!-- </div> -->
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
            availableTools: this.generateToolbarOptions(),
            lists: [
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

        generateToolbarOptions() {
            const icons = [
                { name: 'Move', mode: 0, src: '/vendor/img/tool_icons/Mode_move.svg' },
                { name: 'Point', mode: 1, src: '/vendor/img/tool_icons/Mode_point.svg' },
                { name: 'Join', mode: 2, src: '/vendor/img/tool_icons/Mode_join.svg' },
                { name: 'Parallel', mode: 3, src: '/vendor/img/tool_icons/Mode_parallel.svg' },
                { name: 'Orthogonal', mode: 4, src: '/vendor/img/tool_icons/Mode_orthogonal.svg' },
                { name: 'Intersect', mode: 5, src: '/vendor/img/tool_icons/Mode_intersect.svg' },
                { name: 'Delete', mode: 6, src: '/vendor/img/tool_icons/Mode_delete.svg' },
                { name: 'Vector', mode: 7, src: '/vendor/img/tool_icons/Mode_vector.svg' },
                { name: 'Line_Bisector', mode: 8, src: '/vendor/img/tool_icons/Mode_linebisector.svg' },
                { name: 'Angular_Bisector', mode: 9, src: '/vendor/img/tool_icons/Mode_angularbisector.svg' },
                { name: 'Circle_Two_Points', mode: 10, src: '/vendor/img/tool_icons/Mode_circle2.svg' },
                { name: 'Circle_Three_Points', mode: 11, src: '/vendor/img/tool_icons/Mode_circle3.svg' },
                { name: 'Conic_Five_Points', mode: 12, src: '/vendor/img/tool_icons/Mode_conic5.svg' },
                { name: 'Tangents', mode: 13, src: '/vendor/img/tool_icons/Mode_tangent.svg' },
                { name: 'Relation', mode: 14, src: '/vendor/img/tool_icons/Mode_relation.svg' },
                { name: 'Segment', mode: 15, src: '/vendor/img/tool_icons/Mode_segment.svg' },
                { name: 'Polygon', mode: 16, src: '/vendor/img/tool_icons/Mode_polygon.svg' },
                { name: 'Text', mode: 17, src: '/vendor/img/tool_icons/Mode_text.svg' },
                { name: 'Ray', mode: 18, src: '/vendor/img/tool_icons/Mode_ray.svg' },
                { name: 'Midpoint', mode: 19, src: '/vendor/img/tool_icons/Mode_midpoint.svg' },
                { name: 'Circle_Arc_Three_Points', mode: 20, src: '/vendor/img/tool_icons/Mode_circlearc3.svg' },
                { name: 'Circle_Sector_Three_Points', mode: 21, src: '/vendor/img/tool_icons/Mode_circlesector3.svg' },
                { name: 'Circumcircle_Arc_Three_Points', mode: 22, src: '/vendor/img/tool_icons/Mode_circumcirclearc3.svg' },
                { name: 'Circumcircle_Sector_Three_Points', mode: 23, src: '/vendor/img/tool_icons/Mode_circumcirclesector3.svg' },
                { name: 'Semicircle', mode: 24, src: '/vendor/img/tool_icons/Mode_semicircle.svg' },
                { name: 'Slider', mode: 25, src: '/vendor/img/tool_icons/Mode_slider.svg' },
                { name: 'Image', mode: 26, src: '/vendor/img/tool_icons/Mode_image.svg' },
                { name: 'Show_Hide_Object', mode: 27, src: '/vendor/img/tool_icons/Mode_showhideobject.svg' },
                { name: 'Show_Hide_Label', mode: 28, src: '/vendor/img/tool_icons/Mode_showhidelabel.svg' },
                { name: 'Mirror_At_Point', mode: 29, src: '/vendor/img/tool_icons/Mode_mirroratpoint.svg' },
                { name: 'Mirror_At_Line', mode: 30, src: '/vendor/img/tool_icons/Mode_mirroratline.svg' },
                { name: 'Translate_By_Vector', mode: 31, src: '/vendor/img/tool_icons/Mode_translatebyvector.svg' },
                { name: 'Rotate_By_Angle', mode: 32, src: '/vendor/img/tool_icons/Mode_rotatebyangle.svg' },
                { name: 'Dilate_From_Point', mode: 33, src: '/vendor/img/tool_icons/Mode_dilatefrompoint.svg' },
                { name: 'Circle_Point_Radius', mode: 34, src: '/vendor/img/tool_icons/Mode_circlepointradius.svg' },
                { name: 'Copy_Visual_Style', mode: 35, src: '/vendor/img/tool_icons/Mode_copyvisualstyle.svg' },
                { name: 'Angle', mode: 36, src: '/vendor/img/tool_icons/Mode_angle.svg' },
                { name: 'Vector_From_Point', mode: 37, src: '/vendor/img/tool_icons/Mode_vectorfrompoint.svg' },
                { name: 'Distance', mode: 38, src: '/vendor/img/tool_icons/Mode_distance.svg' },
                { name: 'Move_Rotate', mode: 39, src: '/vendor/img/tool_icons/Mode_moverotate.svg' },
                { name: 'Translateview', mode: 40, src: '/vendor/img/tool_icons/Mode_translateview.svg' },
                { name: 'Zoom_In', mode: 41, src: '/vendor/img/tool_icons/Mode_zoomin.svg' },
                { name: 'Zoom_Out', mode: 42, src: '/vendor/img/tool_icons/Mode_zoomout.svg' },
                { name: 'Polar_Diameter', mode: 44, src: '/vendor/img/tool_icons/Mode_polardiameter.svg' },
                { name: 'Segment_Fixed', mode: 45, src: '/vendor/img/tool_icons/Mode_segmentfixed.svg' },
                { name: 'Angle_Fixed', mode: 46, src: '/vendor/img/tool_icons/Mode_anglefixed.svg' },
                { name: 'Locus', mode: 47, src: '/vendor/img/tool_icons/Mode_locus.svg' },
                { name: 'Macro', mode: 48, src: '/vendor/img/tool_icons/Mode_tool.svg' },
                { name: 'Area', mode: 49, src: '/vendor/img/tool_icons/Mode_area.svg' },
                { name: 'Slope', mode: 50, src: '/vendor/img/tool_icons/Mode_slope.svg' },
                { name: 'Regular_Polygon', mode: 51, src: '/vendor/img/tool_icons/Mode_regularpolygon.svg' },
                { name: 'Show_Hide_Checkbox', mode: 52, src: '/vendor/img/tool_icons/Mode_showcheckbox.svg' },
                { name: 'Compasses', mode: 53, src: '/vendor/img/tool_icons/Mode_compasses.svg' },
                { name: 'Mirror_At_Circle', mode: 54, src: '/vendor/img/tool_icons/Mode_mirroratcircle.svg' },
                { name: 'Ellipse_Three_Points', mode: 55, src: '/vendor/img/tool_icons/Mode_ellipse3.svg' },
                { name: 'Hyperbola_Three_Points', mode: 56, src: '/vendor/img/tool_icons/Mode_hyperbola3.svg' },
                { name: 'Parabola', mode: 57, src: '/vendor/img/tool_icons/Mode_parabola.svg' },
                { name: 'Fitline', mode: 58, src: '/vendor/img/tool_icons/Mode_fitline.svg' },
                { name: 'Record_To_Spreadsheet', mode: 59, src: '/vendor/img/tool_icons/Mode_recordtospreadsheet.svg' },
                { name: 'Attach_Detach_Point', mode: 67, src: '/vendor/img/tool_icons/Mode_attachdetachpoint.svg' },
            ];
            return icons;
        },

        transformArrayToolbarToString() {
            let string = '';

            for (let i = 0; i < this.lists.length; i += 1) {
                if (this.lists[i].length === 0 && (i !== (this.lists.length - 1))) string += '| ';
                for (let j = 0; j < this.lists[i].length; j += 1) {
                    if (this.lists[i][j].mode !== undefined) string += `${this.lists[i][j].mode} `;

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
