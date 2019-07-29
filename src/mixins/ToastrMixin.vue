<script>
import toastr from 'toastr';

export default {
    data() {
        return {
            toastrOptions: {
                closeButton: true,
                progressBar: true,
                preventDuplicates: false,
                positionClass: 'toast-top-center',
                onclick: null,
                showDuration: '400',
                hideDuration: '1000',
                timeOut: '7000',
                extendedTimeOut: '1000',
                showEasing: 'swing',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut',
            },
        };
    },

    methods: {
        showToast(message, type = 'success', options = {}) {
            toastr.options = Object.assign({}, this.toastrOptions, options);

            toastr[type](message);
        },

        clearToast() {
            toastr.clear();
        },
    },
};
</script>
