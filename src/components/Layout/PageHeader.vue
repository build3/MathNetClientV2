<template functional>
    <div class="row border-bottom">
        <nav class="navbar navbar-static-top">
            <div class="navbar-header">
            </div>
            <ul class="nav navbar-top-links navbar-right">
                <li>
                    <router-link :to="{name: 'Home'}">
                        Home
                    </router-link>
                </li>
                <li>
                    <router-link :to="{name: 'Register'}">
                        Register
                    </router-link>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
export default {
    name: 'PageHeader',
};
</script>
