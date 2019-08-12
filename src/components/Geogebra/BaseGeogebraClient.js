import Consts from './Consts';

// Some methods need this linting exception.
// Methods throwing Error (not implemented) but not using 'this' are triggering linter.
/* eslint class-methods-use-this: ["error", { "exceptMethods": [
    "inject","ggbOnInit", "setXML", "registerGlobalListeners",
    "checkLock", "setCaption"] }
] */

export default class BaseGeogebraClient {
    inject() {
        Error('Method not implemented');
    }

    ggbOnInit() {
        Error('Method not implemented');
    }

    /**
     * Set initial construction for the applet. Runs "UpdateConstruction"
     * which triggers re-render of all elements.
     *
     * @param {String} xml
     */
    setConstruction(xml) {
        this.log.debug();
        this.ignoreUpdates = true;

        this.evalXML(xml);
        this.evalCommand('UpdateConstruction()');
        this.checkLocks();

        this.ignoreUpdates = false;
    }

    /**
     * @param {String} label
     * @param {String} xml
     */
    updateElementXML(label, xml) {
        this.log.debug(label);

        this.ignoreUpdates = true;
        this.evalXML(xml);
        this.evalCommand('UpdateConstruction()');
        this.ignoreUpdates = false;
    }

    /**
     * @param {Object} element
     */
    setElement(element) {
        this.log.debug(element);
        this.ignoreUpdates = true;

        if (element.obj_cmd_str !== '') {
            const command = Consts.getCommand(element.name, element.obj_cmd_str);
            this.evalCommand(command);
        }

        this.evalXML(element.xml);
        this.evalCommand('UpdateConstruction()');
        this.checkLock(element.name);

        this.ignoreUpdates = false;
    }

    /**
     * @param {Array[Object]} elements
     */
    setElements(elements) {
        this.log.debug(elements);
        this.ignoreUpdates = true;

        for (const el of elements) {
            // If the element is a compound (e.g. a polygon),
            // it should have a command string assigned which is to
            // be evaluated by the applet.
            if (el.obj_cmd_str !== '') {
                const command = Consts.getCommand(el.name, el.obj_cmd_str);
                this.evalCommand(command);
            }

            this.evalXML(el.xml);
            this.checkLock(el.name);
        }

        this.evalCommand('UpdateConstruction()');
        this.ignoreUpdates = false;
    }

    /**
     * This function grabs all objects in the construction, and sets a
     * lock on them if the username in the caption is not the current user.
     */
    checkLocks() {
        this.log.debug();

        for (let i = 0; i < this.getObjectNumber(); i += 1) {
            const label = this.applet.getObjectName(i); this.checkLock(label);
        }
    }

    /**
     * Assign caption (display name) to single Geogebra element.
     *
     * @param {String} label
     * @param {String} caption
     */
    // eslint-disable-next-line no-unused-vars
    setCaption(label, caption) {
        Error('Method not implemented');
    }

    /**
     * Completely reset XML content of the applet.
     *
     * @param {String} xml
     */
    // eslint-disable-next-line no-unused-vars
    setXML(xml) {
        Error('Method not implemented');
    }

    registerGlobalListeners() {
        Error('Method not implemented');
    }

    checkLock() {
        Error('Method not implemented');
    }

    evalXML(xml) {
        this.applet.evalXML(xml);
    }

    getXML(label) {
        return this.applet.getXML(label);
    }

    evalCommand(command) {
        this.applet.evalCommand(command);
    }

    deleteObject(label) {
        this.applet.deleteObject(label);
    }

    getObjectNumber() {
        return this.applet.getObjectNumber();
    }

    getCaption(label) {
        return this.applet.getCaption(label);
    }

    getCommandString(label) {
        return this.applet.getCommandString(label, false);
    }

    getObjectType(label) {
        return this.applet.getObjectType(label);
    }

    setCaptionStyle(label) {
        this.applet.setLabelStyle(label, Consts.CAPTION_STYLE);
    }

    getObjectName(label) {
        return this.applet.getObjectName(label);
    }

    /**
     * @param {String} label Geogebra element name
     * @param {Array[Number, Number, Number]} color RGB color
     */
    setColor(label, [red, green, blue]) {
        this.applet.setColor(label, red, green, blue);
    }
}
