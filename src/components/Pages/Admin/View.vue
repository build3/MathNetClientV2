<template>
    <div class="view">
        <div class="row">
            <div class="offset-2 col-8">
                <h1 class="ml-2">Class view</h1>
            </div>
        </div>
        <div class="ibox border-bottom offset-2 col-8">
            <div class="ibox-title">
                <h5>Groups</h5>
            </div>
            <div class="ibox-content">
                <div class="row">
                    <div class="col-6">
                        <div class="checkbox form-inline">
                            <label class="checkbox-container">
                                Show menu bar
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
                <div class="row mt-3">
                    <div class="col-12">
                        <button class="btn btn-primary p-2">Merge checked groups</button>
                    </div>
                </div>
            </div>
        </div>
            <div class="ibox border-bottom offset-2 col-8">
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
</template>

<script>
export default {
};
</script>
