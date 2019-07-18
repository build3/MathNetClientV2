<template>
    <div class="student-class">
        <div class="row border-bottom white-bg dashboard-header">
            <h1>Student Class View</h1>
        </div>

        <div class="row">
            <div class="col-8 text-center mx-auto">
                <div class="ibox mt-3">
                    <div class="ibox-content">
                        <table class="footable table table-stripped
                            tablet breakpoint footable-loaded" data-page-size="15">
                            <thead>
                                <tr>
                                    <th data-toggle="true"
                                        class="footable-visible
                                            footable-first-column footable-sortable">
                                        Class
                                        <span class="footable-sort-indicator"></span>
                                    </th>
                                    <th data-hide="action"
                                        class="footable-visible footable-sortable">
                                        Groups in class
                                        <span class="footable-sort-indicator"></span>
                                    </th>
                                    <th data-hide="action"
                                        class="footable-visible footable-sortable">
                                        Action
                                        <span class="footable-sort-indicator"></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="footable-even">
                                    <td class="footable-visible footable-first-column">
                                        <span class="footable-toggle"></span>
                                        Class one
                                    </td>
                                    <td class="footable-visible">
                                        <span class="footable-toggle"></span>
                                        2
                                    </td>
                                    <td class="footable-visible">
                                        <!--Static link only for template mock-up-->
                                        <router-link :to="{name: 'Student-Group'}">
                                            <button class="btn btn-primary btn-sieze-xs">
                                                Join to class
                                            </button>
                                        </router-link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StudentClass',
};
</script>
