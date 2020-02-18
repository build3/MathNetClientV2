/**
 * [StudentClient] provides API for managing Geogebra applet for students.
 * Its public API operates as an event emitter for [listener] argument.
 */

const THROTTLE_PERIOD = 50; // (ms)

// Initial state of the Geogebra applet encoded in Base64
const initialState = require('../../helpers/ggbbase64').default;

const Consts = {
    // Geogebra specific options

    // Caption style related to label style
    // determining how objects' names are displayed in
    // the applet. Caption style means that objects are
    // named by their captions.
    CAPTION_STYLE: 3, // 3 is a magic value for Geogebra's API

    POINT: 'point',
    TEXTFIELD: 'textfield',
    NUMERIC: 'numeric',

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
};

/**
 * Throttle ensures that function [func] is evaluated at most once per
 * [limit] period.
 */
function throttle(func, limit) {
    let inThrottle;

    return function wrapper(...args) {
        const context = this;

        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Debounce ensures that the function [func] is evaluated after [delay]
 * time since the last call to the function (classic debounce behavior).
 */
// function debounce(func, delay) {
//     // [inDebounce] is a variable used to track the delay period.  If
//     // invoked for the first time, the [func] will execute at the end of
//     // the delay.  If invoked and then invoked again before the end of the
//     // delay, the delay restarts.
//     let inDebounce;

//     return function (...args) {
//         const context = this;

//         clearTimeout(inDebounce);
//         inDebounce = setTimeout(() => func.apply(context, args), delay);
//     };
// }

class StudentClient {
    /**
     * @param {Object} params Geogebra applet parameters
     * (https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters).
     *
     * @param {Object} log Vue logger.
     */
    constructor(params) {
        this.params = {
            container: 'geogebra_designer',
            id: 'applet',
            width: 800,
            height: 800 * 9 / 16,
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
            resizeFactor: 1.0,
            // Initial Geogebra state encoded in Base64
            ggbBase64: initialState,
            ...params,
        };

        this.log = this.params.log;
        this.params.listener = undefined;
        /* eslint-disable-next-line no-undef */
        this.appletContainer = new GGBApplet(this.params);

        // This flag is used to temporarirly turn-off Geogebra
        // callback handlers when other updates are taking place.
        // Its used primarly to ignore updates triggered by manual
        // changes to the element (from the code).
        // Typical usage is as follows: flip the flag, do something,
        // flip the flag.
        this.ignoreUpdates = false;
    }

    /**
     * Called by the client to start initializing the applet.
     *
     * @param listener Observer object, notified of important events such as
     * `onAddElement`.
     */
    async initApplet(listener) {
        this.log.debug(listener);

        this.listener = listener;

        // Geogebra uses global callbacks.
        window.ggbOnInit = this.ggbOnInit.bind(this);

        // Start applet render. When finished, `window.ggbOnInit` will be
        // called.
        this.appletContainer.inject(this.params.container, 'auto');
    }

    /**
     * Internal callback for successful initialization of the applet.
     * Finishes initialization process and notifies listener.
     */
    ggbOnInit() {
        this.log.debug();

        // Save reference to the applet itself. This is the main line
        // of communication between Geogebra and the rest of the code.
        this.applet = this.appletContainer.getAppletObject();
        this.applet.setPerspective('G');


        if (this.appletId !== undefined) {
            return;
        }

        this.appletId = Math.floor(Math.random() * 10000);

        // In case Geogebra is caching, clear everything.
        this.applet.reset();
        this.applet.newConstruction();

        // Geogebra uses global listeners on `window` to notify of its
        // internal events (such as when element is added/modified/deleted).
        this.registerGlobalListeners();

        // // Resize applet on window resize.
        // window.onresize(() => {
        //     this.applet.setHeight(window.innerHeight / this.params.resizeFactor);
        // });

        // Notify listener.
        this.listener.onAppletReady();

        // Remove Geogebra's undo history.
        window.sessionStorage.clear();
    }

    /**
     * Geogebra uses global listeners on `window` to notify of its
     * internal events (such as when element is added/modified/deleted).
     * This methods sets and links those listeners with this object.
     *
     * Call chain is as follows:
     * Geogebra -> Window -> Client
     */
    registerGlobalListeners() {
        // Setup `window` methods which refer to this object.
        window[`addListener${this.appletId}`] = label => this.onAddElement(label);

        window[`updateListener${this.appletId}`] = label => this.onUpdateElement(label);

        window[`removeListener${this.appletId}`] = label => this.onRemoveElement(label);

        window[`renameListener${this.appletId}`] = throttle(
            (oldLabel, newLabel) => this.onRenameElement(oldLabel, newLabel),
            THROTTLE_PERIOD,
        );

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

    /**
     * @param {String} label Name of the Geogebra element
     */
    onUpdateElement(label) {
        if (this.ignoreUpdates === false) {
            // Pass event to listener to handle it.
            this.listener.onUpdateElement(label);
        }
    }

    /**
     * @param {String} label Name of the Geogebra element
     */
    onAddElement(label) {
        if (this.ignoreUpdates === false) {
            // Pass event to listener to handle it.
            this.listener.onAddElement(label);
        }
    }

    /**
     * @param {String} label Name of the Geogebra element
     */
    onRemoveElement(label) {
        this.log.debug(label);

        if (this.ignoreUpdates === false) {
            // Pass event to listener to handle it.
            this.listener.onRemoveElement(label);
        }
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
        // XXX: Not sure if we need it here.
        this.checkLock(label);

        setTimeout(() => {
            this.ignoreUpdates = false;
        });
    }

    /**
     * Removes all elements from the applet one by one (so that
     * [onRemoveElement] is called for each object).
     */
    clear() {
        this.applet.getAllObjectNames()
            .forEach((obj) => {
                this.applet.deleteObject(obj);
            });
    }

    /**
     * Assign caption (display name) to single Geogebra element.
     *
     * @param {String} label
     * @param {String} caption
     */
    setCaption(label, caption) {
        this.log.debug(label, caption);
        this.ignoreUpdates = true;

        // Configure element to display caption as its display name.
        this.applet.setLabelStyle(label, Consts.CAPTION_STYLE);
        this.applet.setCaption(label, caption);

        this.ignoreUpdates = false;
    }

    /**
     * Set initial construction for the applet. Runs "UpdateConstruction"
     * which triggers re-render of all elements.
     *
     * @param {String} xml
     */
    setConstruction(xml) {
        this.ignoreUpdates = true;
        this.evalXML(xml);
        this.evalCommand('UpdateConstruction()');
        // const evaluatedXml = this.applet.getXML();
        // const fixedXML = evaluatedXml.replace(/labelingStyle val="0"/, "labelingStyle val=\"3\"");
        // this.evalXML(fixedXML);
        // this.evalCommand('UpdateConstruction()');
        // parse the things that GGB seems to ignore
        // start with grid
        setTimeout(() => this.processAdditionalXmlAttributes(xml));
        this.checkLocks();
        this.ignoreUpdates = false;
    }

    processAdditionalXmlAttributes(xml, properties = {}) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        // if (properties.perspective) {
        //     this.setPerspective(properties.perspective);
        // } else {
        //     this.setPerspective('G');
        // }

        this.enableShiftDragZoom(false);

        const evSettings = xmlDoc.getElementsByTagName('evSettings')[0];
        if (!evSettings){
            return;
        }
        this.setGridVisible(evSettings.getAttribute('grid') === 'true');

        // then force the same aspect ratio as the teacher
        const coordSystemTag = xmlDoc.getElementsByTagName('coordSystem')[0];
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // calc ratio of current width to teacher width
        if (properties.view) {
            const viewProps = JSON.parse(properties.view);
            const constructionXZero = viewProps.xMin;
            const constructionYZero = viewProps.yMin;
            const constructionScale = parseFloat(coordSystemTag.getAttribute('scale'));
            const constructionYScale = parseFloat(coordSystemTag.getAttribute('yscale'));
            // const width = parseInt(windowTag.getAttribute('width'), 10);
            // const height = parseInt(windowTag.getAttribute('height'), 10);
            // const targetAspectRatio = width / height;
            // const existingAspectRatio = this.getWidth() / this.getHeight();
            // this.setHeight(this.getWidth() * (existingAspectRatio / targetAspectRatio));
            // no need to adjust height
            // now set the coordinate system
            console.log(`${constructionXZero}, ${constructionYZero} -- ${constructionScale}, ${constructionYScale}`);
            this.setCoordSystem(constructionXZero,
                (viewProps.width / constructionScale) + constructionXZero,
                constructionYZero,
                (viewProps.height / constructionYScale) + constructionYZero);
        }
    }

    setCoordSystem(xmin, xmax, ymin, ymax) {
        this.applet.setCoordSystem(xmin, xmax, ymin, ymax);
    }

    setGridVisible(visible) {
        this.applet.setGridVisible(visible);
    }

    setWidth(width) {
        this.applet.setWidth(width);
    }

    setHeight(height) {
        this.applet.setHeight(height);
    }

    getHeight() {
        const xml = this.applet.getXML();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // eslint-disable-next-line radix
        return parseInt(windowTag.getAttribute('height'));
    }

    getWidth() {
        const xml = this.applet.getXML();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // eslint-disable-next-line radix
        return parseInt(windowTag.getAttribute('width'));
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

        /* eslint-disable-next-line no-restricted-syntax */
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
     * @param {String} label Geogebra element name
     * @param {Array[Number, Number, Number]} color RGB color
     */
    setColor(label, [red, green, blue]) {
        this.applet.setColor(label, red, green, blue);
    }

    /**
     * Checks and locks Geogebra element if necessary.
     * Locked element cannot be moved from the UI. This ensures that
     * students can move elements owned by them or claim unassigned ones.
     *
     * @param {String} label
     */
    checkLock(label) {
        this.log.debug(label);

        const caption = this.applet.getCaption(label);
        const objType = this.applet.getObjectType(label);

        // Element is free for movable by the student.
        if (this.listener.isMovable(label, caption)) {
            // this.setFixed(label, objType !== Consts.POINT);
            if (objType === Consts.NUMERIC || objType === Consts.TEXTFIELD) {
                this.setFixed(label, false, /* is selection allowed */ true);
            } else {
                this.setFixed(label, false);
            }
            // Someone else is the owner of the object.
        } else if (!this.listener.isOwner(label, caption)) {
            if (objType === Consts.NUMERIC || objType === Consts.TEXTFIELD) {
                this.setFixed(label, true, /* is selection allowed */ false);
            } else {
                this.setFixed(label, true);
            }
        }
    }

    /**
     * This function grabs all objects in the construction, and sets a
     * lock on them if the username in the caption is not the current user.
     */
    checkLocks() {
        this.log.debug();

        for (let i = 0; i < this.getObjectNumber(); i += 1) {
            const label = this.applet.getObjectName(i);
            this.checkLock(label);
        }
    }

    /**
     * Completely reset XML content of the applet.
     *
     * @param {String} xml
     */
    setXML(xml) {
        this.log.debug(xml);
        this.ignoreUpdates = true;

        this.applet.setXML(xml);
        this.checkLocks();
        this.registerGlobalListeners();

        this.ignoreUpdates = false;
    }

    deleteObject(label) {
        this.applet.deleteObject(label);
    }

    registerObjectClickListener(label, listener) {
        this.applet.registerObjectClickListener(label, listener);
    }

    getObjectNumber() {
        return this.applet.getObjectNumber();
    }

    isMovable(label) {
        return this.applet.isMoveable(label);
    }

    getCaption(label) {
        return this.applet.getCaption(label);
    }

    getAllObjectNames() {
        return this.applet.getAllObjectNames();
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

    evalXML(xml) {
        this.applet.evalXML(xml);
    }

    getObjectName(label) {
        return this.applet.getObjectName(label);
    }

    getXML(label) {
        return this.applet.getXML(label);
    }

    evalCommand(command) {
        this.applet.evalCommand(command);
    }

    setFixed(label, isFixed, isSelectable) {
        this.applet.setFixed(label, isFixed, isSelectable);
    }

    getXcoord(label) {
        return this.applet.getXcoord(label);
    }

    getYcoord(label) {
        return this.applet.getYcoord(label);
    }

    getZcoord(label) {
        return this.applet.getZcoord(label);
    }

    newConstruction() {
        if (this.client) {
            this.client.newConstruction();
        }
    }

    setPerspective(perspective) {
        this.log.debug('Setting perspective', perspective);
        this.applet.setPerspective(perspective);
    }

    enableShiftDragZoom(enable){
        this.applet.enableShiftDragZoom(enable);
    }

    setCustomToolBar(toolbar) {
        this.log.debug('Setting toolbar', toolbar);
        this.applet.setCustomToolBar(toolbar);
    }
}

module.exports = {
    StudentClient,
    Consts,
};
