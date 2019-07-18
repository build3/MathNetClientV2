// import GGBApplet from '../../vendor/js/deployggb';

export default class {
    constructor(domElementId) {
        this.params = {
            container: domElementId,
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
        };

        window.ggbOnInit = this.ggbOnInit.bind(this);

        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);
        // this.appletContainer.setHTML5Codebase('/5.0/web3d/');
    }

    inject() {
        this.appletContainer.inject(this.params.container, 'auto');
    }

    ggbOnInit() {
        this.applet = this.appletContainer.getAppletObject();
    }

    getXML() {
        return this.applet.getXML();
    }

    setXML(xml) {
        this.applet.setXML(xml);
    }
}
