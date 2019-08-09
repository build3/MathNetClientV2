import Consts from './Consts';
import StudentListener from '../Pages/Student/StudentListener';

export default class {
    constructor(params) {
        this.params = {
            container: 'geogebra_designer',
            id: 'geogebra_designer',
            width: 800,
            height: 600,
            scaleContainerClass: 'appletContainer',
            ...Consts.DEFAULT_PARAMS,
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
            const caption = StudentListener.getElementCaption(label, Consts.UNASSIGNED);
            this.setCaption(label, caption);
        }
    }

    setCaption(objectLabel, caption) {
        this.ignoreUpdates = true;
        const objType = this.applet.getObjectType(objectLabel);
        if (objType === Consts.POINT) {
            this.applet.setLabelStyle(objectLabel, Consts.CAPTION_STYLE);
        }
        this.applet.setCaption(objectLabel, caption);
        this.ignoreUpdates = false;
    }
}
