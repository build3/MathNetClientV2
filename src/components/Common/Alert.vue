<template>
<div v-if="alert"
    class="alert alert-dismissible fade show"
    :class="'alert-' + alert.type"
    role="alert">
    {{ alert.message }}
    <button v-if="alert.type !== 'info'"
        type="button"
        class="close"
        data-dismiss="alert"
        aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
</div>
</template>

<script>
export default {
    name: 'Alert',

    props: {
        alert: {
            default: undefined,
            type: Object,
        },
    },
};
</script>
