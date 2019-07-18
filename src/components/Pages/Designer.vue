<template>
    <div class="designer">
        <div class="row border-bottom white-bg dashboard-header">
            <h1>Geogebra Designer</h1>
        </div>
        <div class="wrapper wrapper-content">
            <div class="row">
                <div class="col-12">
                    <div class="ibox border-bottom">
                        <div class="ibox-title">
                            <h5>Designer</h5>
                            <div class="ibox-tools">
                                <a class="collapse-link">
                                    <i class="fa fa-chevron-down"></i>
                                </a>
                            </div>
                        </div>
                        <div class="ibox-content table-responsive ibox-style-extender">
                            <div class="row">
                                <div class="col-6">
                                    <div class="col-10">
                                        <h2>Constructions</h2>
                                        <select multiple="multiple"
                                            id="bootstrap-duallistbox-nonselected-list_"
                                            class="form-control select-extender"
                                            name="_helper1">
                                            <option value="option1">option1</option>
                                            <option value="option2">option2</option>
                                        </select>
                                    </div>
                                    <div class="form-inline mt-3 col-12">
                                        <button class="btn btn-primary p-2 m-1">
                                            Use construction</button>
                                        <button class="btn btn-warning p-2 m-1">
                                            Edit construction</button>
                                        <button class="btn btn-danger p-2 m-1">
                                            Delete construction</button>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="col-10">
                                        <h2>Groups</h2>
                                        <select multiple="multiple"
                                            id="bootstrap-duallistbox-nonselected-list_"
                                            class="form-control select-style-extender"
                                            name="_helper2">
                                            <option value="option1">option1</option>
                                            <option value="option2">option2</option>
                                        </select>
                                    </div>
                                    <div class="form-inline mt-3 col-12">
                                        <button class="btn btn-primary p-2 m-1">
                                            Send view to one</button>
                                        <button class="btn btn-primary p-2 m-1">
                                            Send view to all</button>
                                        <div class="checkbox m-r-xs form-inline">
                                            <input class="ml-2" type="checkbox" id="checkbox1">
                                            <label class="ml-1" for="checkbox1">
                                                Show menu bars</label>
                                            <input class="ml-2" type="checkbox" id="checkbox2">
                                            <label class="ml-1" for="checkbox2">
                                                Send toolbar</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-5">
                                <div class="col-12">
                                    <button class="btn btn-warning p-2">Reset view</button>
                                    <div id="geogebraDesigner" class="geogebra-applet">
                                        <!--Main geogebra applet-->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ibox border-bottom">
                        <div class="ibox-title">
                            <h5>Toolbars</h5>
                            <div class="ibox-tools">
                                <a class="collapse-link">
                                    <i class="fa fa-chevron-down"></i>
                                </a>
                            </div>
                        </div>
                        <div class="ibox-content table-responsive ibox-style-extender">
                            <div class="row">
                                <div class="col-12">
                                    <h2>Customize Toolbars</h2>
                                    <div class="geogebra-tools mt-3">
                                        <!--toolbar from geogebra-->
                                    </div>
                                    <div class="col-5">
                                        <h4>Select Toolbar</h4>
                                        <select multiple="multiple"
                                            id="bootstrap-duallistbox-nonselected-list_"
                                            class="form-control select-style-extender"
                                            name="_helper1">
                                            <option value="option1">option1</option>
                                            <option value="option2">option2</option>
                                        </select>
                                    </div>
                                    <div class="form-inline mt-3 col-12">
                                        <button class="btn btn-primary p-2 m-1">
                                            Use Toolbar</button>
                                        <button class="btn btn-danger p-2 m-1">
                                            Delete Toolbar</button>
                                    </div>
                                </div>
                                <div class="col-12 mt-2">
                                    <div class="toolbar-options">
                                        <h3>Toolbar</h3>
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
                                    <div class="row">
                                        <div class="position-options">
                                            <div class="checkbox m-r-xs form-inline mt-2">
                                                <input class="ml-2" type="checkbox" id="checkbox3">
                                                <label class="ml-1" for="checkbox3">
                                                    Axis dispaly</label>
                                                <input class="ml-2" type="checkbox" id="checkbox4">
                                                <label class="ml-1" for="checkbox4">
                                                    Grid display</label>
                                            </div>
                                            <div class="m-2">
                                                <select
                                                    id="bootstrap-duallistbox-nonselected-list_"
                                                    class="form-control" name="_helper3">
                                                    <option value="option1">option1</option>
                                                    <option value="option2">option2</option>
                                                </select>
                                            </div>
                                            <div class="m-2">
                                                <input type="checkbox" id="checkbox5">
                                                <label for="checkbox5">Manual perspective</label>
                                            </div>
                                            <div class="m-2 window-options">
                                                <h4>Window Dimensions</h4>
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
                                                <div class="m-2">
                                                    <input type="checkbox" id="checkbox6">
                                                    <label for="checkbox6">
                                                        Use the above settings for Graphics 2
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-5">
                                            <h4>Class users</h4>
                                            <select multiple="multiple"
                                                id="bootstrap-duallistbox-nonselected-list_"
                                                class="form-control select-extender"
                                                name="_helper4">
                                            </select>
                                            <button class="btn btn-primary mt-3">Send</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GeogebraInterface from '../Geogebra/GeogebraInterface';

export default {
    mounted() {
        // simple example code to show how to initialize GeoGebra
        const GI = new GeogebraInterface('geogebraDesigner'); // initializing our custom class
        GI.inject(); // injecting applet into HTML
        // eslint-disable-next-line no-console
        console.log(GI);

        setTimeout(() => { // callbacking Geogebra is not included atm
            const xml = GI.getXML(); // getting Geogebra state
            // eslint-disable-next-line no-console
            console.log('XML is ', xml); // resulting xml
            GI.setXML(xml); // setting Geogebra state from xml
        }, 3000);
    },
};
</script>
