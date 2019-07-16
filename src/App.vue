<template functional>
    <div id="wrapper">
        <side-menu/>

        <main id="page-wrapper" class="gray-bg">
            <page-header/>
            <div class="wrapper wrapper-content">
                <router-view></router-view>
            </div>
        </main>

    </div>
</template>

<script>

export default {
    name: 'App',
};
</script>
