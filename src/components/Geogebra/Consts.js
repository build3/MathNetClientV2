import ggbBase64 from '../../helpers/ggbbase64';

export default {
    // Geogebra specific options

    // Caption style related to label style
    // determining how objects' names are displayed in
    // the applet. Caption style means that objects are
    // named by their captions.
    CAPTION_STYLE: 3, // 3 is a magic value for Geogebra's API

    POINT: 'point',
    TEXTFIELD: 'textfield',
    NUMERIC: 'numeric',
    UNASSIGNED: 'unassigned',

    // Initial state of the Geogebra applet encoded in Base64


    /**
     * GGB commands have the following
     * format: <object-label>:<command-body>.
     *
     * @param {String} label
     * @param {String} cmdStrBody
     */
    getCommand(label, cmdStrBody) {
        return `${label}:${cmdStrBody}`;
    },

    DEFAULT_PARAMS: {
        perspective: 'AG',
        showAlgebraInput: true,
        showToolBarHelp: false,
        showMenubar: true,
        enableLabelDrags: false,
        showResetIcon: false,
        showToolbar: true,
        allowStyleBar: false,
        useBrowserForJS: true,
        enableShiftDragZoom: true,
        errorDialogsActive: true,
        enableRightClick: false,
        enableCAS: false,
        enable3d: false,
        isPreloader: false,
        screenshotGenerator: false,
        preventFocus: false,
        log: undefined,
        // Initial state of the Geogebra applet encoded in Base64
        ggbBase64,
    },
};
