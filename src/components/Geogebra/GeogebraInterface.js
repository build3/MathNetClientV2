import ggbBase64 from '../../helpers/ggbbase64';
import StudentListener from '../Pages/Student/StudentListener';

const POINT = 'point';
const CAPTION_STYLE = 3;
const UNASSIGNED = 'unassigned';

export default class {
    constructor(params, teacherUsername) {
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

        this.log = params.log;

        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);
        // this.appletContainer.setHTML5Codebase('/5.0/web3d/');

        this.teacherUsername = teacherUsername;
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

    /**
     * Completely reset XML content of the applet.
     * Modified version, without checkLocks
     * @param {String} xml
     */
    setXML(xml) {
        this.log.debug(xml);
        this.ignoreUpdates = true;

        this.applet.setXML(xml);
        // this.checkLocks();
        this.registerGlobalListeners();
        this.saveStateToLocalStorage();

        this.ignoreUpdates = false;
    }

    registerGlobalListeners() {
        // Setup `window` methods which refer to this object.
        window[`addListener${this.appletId}`] = label => this.onAddElement(label);

        window[`updateListener${this.appletId}`] = label => this.onUpdateElement(label);

        window[`removeListener${this.appletId}`] = label => this.onRemoveElement(label);

        window[`renameListener${this.appletId}`] = (oldLabel, newLabel) => this.onRenameElement(oldLabel, newLabel);

        // Clean-up any state.
        this.applet.unregisterAddListener(`addListener${this.appletId}`);
        this.applet.unregisterUpdateListener(`updateListener${this.appletId}`);
        this.applet.unregisterRemoveListener(`removeListener${this.appletId}`);
        this.applet.unregisterRenameListener(`renameListener${this.appletId}`);

        // Link `window` methods with the applet.
        this.applet.registerAddListener(`addListener${this.appletId}`);
        this.applet.registerUpdateListener(`updateListener${this.appletId}`);
        this.applet.registerRemoveListener(`removeListener${this.appletId}`);
        this.applet.registerRenameListener(`renameListener${this.appletId}`);
    }

    onAddElement(label) {
        if (!this.ignoreUpdates) {
            const caption = StudentListener.getElementCaption(label, UNASSIGNED);
            this.setCaption(label, caption);

            this.saveStateToLocalStorage();
        }
    }

    onUpdateElement() {
        if (!this.ignoreUpdates) {
            this.saveStateToLocalStorage();
        }
    }

    onRemoveElement() {
        if (!this.ignoreUpdates) {
            this.saveStateToLocalStorage();
        }
    }

    onRenameElement() {
        if (!this.ignoreUpdates) {
            this.saveStateToLocalStorage();
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

    setPerspective(perspective) {
        this.log.debug('Setting perspective', perspective);
        this.applet.setPerspective(perspective);
    }

    getXMLItemName(username) {
        this.log.debug('Username', username);
        return `xml-${username}`;
    }

    saveStateToLocalStorage() {
        this.log.debug('Saving XML');
        window.localStorage.setItem(this.getXMLItemName(this.teacherUsername), this.getXML());
    }
}
