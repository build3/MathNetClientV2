import Consts from './Consts';

/**
 * [StudentClient] provides API for managing Geogebra applet for students.
 * Its public API operates as an event emitter for [listener] argument.
 */

const THROTTLE_PERIOD = 50; // (ms)

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
            setTimeout(() => { inThrottle = false; }, limit);
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

export default class StudentClient {
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
            height: 600,
            scaleContainerClass: 'appletContainer',
            resizeFactor: 1.0,
            ...Consts.DEFAULT_PARAMS,
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

        // Geogebra uses global listeners on `window` to notify of its
        // internal events (such as when element is added/modified/deleted).
        this.registerGlobalListeners();

        // Resize applet on window resize.
        window.onresize(() => {
            this.applet.setHeight(window.innerHeight / this.params.resizeFactor);
        });

        // Notify listener.
        this.listener.onAppletReady();
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

        window[`removeListener${this.appletId}`] = throttle(
            label => this.onRemoveElement(label),
            THROTTLE_PERIOD,
        );

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
     * Removes all elements from the applet one by one (so that
     * [onRemoveElement] is called for each object).
     */
    clear() {
        this.applet.getAllObjectNames().forEach((obj) => {
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

    registerObjectClickListener(label, listener) {
        this.applet.registerObjectClickListener(label, listener);
    }

    isMovable(label) {
        return this.applet.isMoveable(label);
    }

    setFixed(label, isFixed, isSelectable) {
        this.applet.setFixed(label, isFixed, isSelectable);
    }
}