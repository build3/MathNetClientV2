export default class {
    constructor(params) {
        this.params = {
            container: 'geogebra_designer',
            id: 'applet',
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
        if (this.ignoreUpdates) return;

        console.log('Admin add listener called');
        this.setCaption(label, 'unassigned');
    }

    setCaption(objectLabel, caption) {
        this.ignoreUpdates = true;
        const type = this.applet.getObjectType(objectLabel);
        if (type === 'point') {
            this.applet.setLabelStyle(objectLabel, 3);
        }
        this.applet.setCaption(objectLabel, caption);
        this.ignoreUpdates = false;
    }
}
