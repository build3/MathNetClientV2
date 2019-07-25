import ggbBase64 from '../../helpers/ggbbase64';

const POINT = 'point';
const CAPTION_STYLE = 3;

export default class {
    constructor(params) {
        this.params = {
            container: 'geogebra_designer',
            id: 'geogebra_designer',
            width: 800,
            height: 600,
            perspective: 'AG',
            showAlgebraInput: true,
            showToolBarHelp: false,
            showMenubar: true,
            enableLabelDrags: false,
            showResetIcon: true,
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
            scaleContainerClass: 'appletContainer',
            ggbBase64,
            ...params,
        };

        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);
        // this.appletContainer.setHTML5Codebase('/5.0/web3d/');
    }

    inject(callback) {
        window.ggbOnInit = () => {
            this.ggbOnInit();
            callback();
        };

        this.appletContainer.inject(this.params.container, 'auto');
    }

    ggbOnInit() {
        this.applet = this.appletContainer.getAppletObject();

        this.registerGlobalListeners();
    }

    getXML() {
        return this.applet.getXML();
    }

    setXML(xml) {
        this.applet.setXML(xml);
    }

    registerGlobalListeners() {
        window[`addListener${this.appletId}`] = label => this.onAddElement(label);
        this.applet.unregisterAddListener(`addListener${this.appletId}`);
        this.applet.registerAddListener(`addListener${this.appletId}`);
    }

    onAddElement(label) {
        if (!this.ignoreUpdates) {
            this.setCaption(label, `${label}_{unassigned}`);
        }
    }

    setCaption(objectLabel, caption) {
        this.ignoreUpdates = true;
        const objType = this.applet.getObjectType(objectLabel);
        if (objType === POINT) {
            this.applet.setLabelStyle(objectLabel, CAPTION_STYLE);
        }
        this.applet.setCaption(objectLabel, caption);
        this.ignoreUpdates = false;
    }
}
