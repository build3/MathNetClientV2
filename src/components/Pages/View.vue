<template>
    <div class="view">
        <div class="row border-bottom white-bg dashboard-header">
            <h1>Class view</h1>
        </div>
        <div class="wrapper wrapper-content">
            <div class="col-12">
                <div class="ibox border-bottom">
                    <div class="ibox-title">
                        <h5>Groups</h5>
                    </div>
                    <div class="ibox-content">
                        <div class="row">
                            <div class="checkbox m-r-xs form-inline">
                                <input class="ml-2" type="checkbox" id="checkbox1">
                                    <label class="ml-1" for="checkbox1">Show menu bar
                                    </label>
                                <input class="ml-2" type="checkbox" id="checkbox2">
                                    <label class="ml-1" for="checkbox2">Send toolbar
                                    </label>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <button class="btn btn-primary p-2">Merge checked groups</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ibox border-bottom">
                    <div class="ibox-title">
                        <h5>List groups</h5>
                    </div>
                    <div class="ibox-content">
                        <div class="row">
                            <div class="col-12 form-inline">
                                <button class="btn btn-warning p-2">Clear Class</button>
                                <button class="btn btn-warning p-2 ml-2">Clear Group</button>
                            </div>
                        </div>
                        <div class="row groups-xml">
                            <!--All groups xml-->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
};
</script>
