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
                        <!---<1!--toolbar from geogebra--1>--->
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
                        <div class="checkbox form-inline mt-4">
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
                        </div>
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
export default {

};
</script>
