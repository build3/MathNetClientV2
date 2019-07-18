<template>
    <div class="student-geogebra">
        <div class="row border-bottom white-bg dashboard-header">
            <h1>Student Geogebra View</h1>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <div class="ibox border-bottom">
                    <div class="ibox-title form-inline">
                        <h3>Group one, {{ student.username }}</h3>
                        <div class="leave-option">
                            <router-link :to="{name: 'Student-Group'}">
                                <button class="btn btn-danger">Leave Group</button>
                            </router-link>
                        </div>
                    </div>
                    <div class="ibox-content">
                        <div class="geogebra-view">
                            <!--Geogebra applet-->
                        </div>
                        <div class="control-options">
                            <div class="col-5">
                                <button class="btn btn-info center-btn-up">Up(I)</button>
                                <div class="form-inline">
                                    <button class="btn btn-info m-2">Left(J)</button>
                                    <p class="mt-3">Selected object:</p>
                                    <button class="btn btn-info m-2">Right(L)</button>
                                </div>
                                <button class="btn btn-info center-btn-down">Down(K)</button>
                                <div class="slidecontainer mt-4">
                                    <input type="range" min="1" max="10" value="1"
                                        class="slider" id="myRange">
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
import { mapGetters } from 'vuex';

export default {
    name: 'StudentGeogebra',
    computed: {
        ...mapGetters('users', {
            student: 'current',
        }),
    },
};
</script>
