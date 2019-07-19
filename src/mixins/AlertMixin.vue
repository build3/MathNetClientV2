<script>
import Alert from '../components/Common/Alert.vue';

export default {
    components: {
        alert: Alert,
    },

    data() {
        return {
            alert: undefined,
        };
    },

    methods: {
        dismissAlert() {
            this.alert = undefined;
        },
    },
};
</script>
