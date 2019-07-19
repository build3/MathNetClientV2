<template>
    <div class="student-class">
        <div class="row">
            <div class="offset-2 col-8">
                <h1>Student Class View</h1>
            </div>
            <div class="ibox border-bottom offset-2 col-8">
                <div class="ibox-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    Class
                                    <span class="footable-sort-indicator"></span>
                                </th>
                            <th>
                                Groups in class
                                <span class="footable-sort-indicator"></span>
                            </th>
                            <th>
                                Action
                                <span class="footable-sort-indicator"></span>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
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
</template>

<script>
export default {
    name: 'StudentClass',
};
</script>
