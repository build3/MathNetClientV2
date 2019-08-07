import feathersClient from '../../feathers-client';

const api = feathersClient;

const Consts = {
    // Ownership indicators

    UNASSIGNED: 'unassigned',
    ADMIN: 'admin', // ~teacher
    USERNAME: 'username',

    // Geogebra specific options

    // Caption style related to label style
    // determining how objects' names are displayed in
    // the applet. Caption style means that objects are
    // named by their captions.
    CAPTION_STYLE: 3,

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

class GeogebraAdminView {
    constructor(params, workshopId /* geogebraViewsParent */) {
        this.params = {
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
            ...params,
        };

        this.workshopId = workshopId;

        GeogebraAdminView.registerApplet(this.params.id, this.ggbOnInit.bind(this));
        // GeogebraAdminView.registerParentViewObject(geogebraViewsParent);
        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);

        this.ignoreUpdates = false;
    }

    static initRegistry() {
        if (!GeogebraAdminView.appletRegistry) {
            GeogebraAdminView.appletRegistry = {};
        }
    }

    static registerApplet(appletId, initCallback) {
        GeogebraAdminView.initRegistry();
        GeogebraAdminView.appletRegistry[appletId] = initCallback;
    }

    // static registerParentViewObject(geogebraViewsObject) {
    //     console.log('registerParentViewObject');
    //     if (!GeogebraAdminView.parentObject) {
    //         GeogebraAdminView.parentObject = geogebraViewsObject;
    //     }
    // }
    //
    // static checkIfAllObjectsInitialized() {
    //     const num = GeogebraAdminView.parentObject.GVs.length;
    //     let numInitialized = 0;
    //
    //     console.log('num, numInitialized', num, numInitialized);
    //
    //     GeogebraAdminView.parentObject.GVs.forEach((obj) => {
    //         if (obj.isInitialized) numInitialized += 1;
    //     });
    //
    //     if (num === numInitialized) {
    //         console.log('All objects initialized, firing initListener');
    //         GeogebraAdminView.parentObject.initListener();
    //     } else {
    //         console.log('Not all objects initialized');
    //     }
    // }

    static globalInitHandler(applet) {
        console.log(`Initializing ${applet}`);
        GeogebraAdminView.initRegistry();
        if (GeogebraAdminView.appletRegistry[applet]) {
            console.log(`${applet} has callbacks`);
            GeogebraAdminView.appletRegistry[applet](applet);
        } else {
            console.log(`Could not find applet for ID ${applet}`);
        }

        // if (GeogebraAdminView.parentObject) {
        //     console.log('checkIfAllObjectsInitialized');
        //     GeogebraAdminView.checkIfAllObjectsInitialized();
        // }
    }

    inject() {
        this.appletContainer.inject(this.params.container, 'auto');
    }

    ggbOnInit() {
        this.applet = this.appletContainer.getAppletObject();
        this.isInitialized = true;
        this.onAppletReady();
    }

    getXML() {
        return this.applet.getXML();
    }

    setXML(xml) {
        this.applet.setXML(xml);
    }

    evalXML(xml) {
        this.applet.evalXML(xml);
    }

    evalCommand(command) {
        this.applet.evalCommand(command);
    }

    getObjectNumber() {
        return this.applet.getObjectNumber();
    }

    async onAppletReady() {
        // Load current state of the workshops.

        // eslint-disable-next-line prefer-const
        let [workshop, ...rest] = await api.service('workshops').find({
            query: { id: this.workshopId },
        });

        console.log('Workshop, rest', workshop, rest);

        if (workshop) {
            // Set initial construction based on the `xml` field.
            this.setConstruction(workshop.xml);

            // Load any existing elements in the workshop.
            const elements = await api.service('elements').find({
                query: { workshop: workshop.id },
            }) || [];

            console.log('Loaded elements:', elements);

            this.setElements(elements);

        // Workshops was not created yet, create it.
        } else {
            workshop = await api.service('workshops').create({
                id: this.workshopId,
            });

            console.log('Created workshop: ', workshop);
        }
    }

    setConstruction(xml) {
        this.ignoreUpdates = true;
        this.evalXML(xml);
        this.evalCommand('UpdateConstruction()');
        this.checkLocks();
        this.ignoreUpdates = false;
    }

    /**
     * @param {Object} element
     */
    setElement(element) {
        this.ignoreUpdates = true;

        if (element.obj_cmd_str !== '') {
            // TODO: Explain this
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
        this.ignoreUpdates = true;

        elements.forEach((el) => {
            // If the element is a compound (e.g. a polygon),
            // it should have a command string assigned which is to
            // be evaluated by the applet.
            if (el.obj_cmd_str !== '') {
                // TODO: Explain this
                const command = Consts.getCommand(el.name, el.obj_cmd_str);
                this.evalCommand(command);
            }

            this.evalXML(el.xml);
            this.evalCommand('UpdateConstruction()');

            if (el.colors) {
                const [red, green, blue] = el.colors;
                this.setColor(el.name, red, green, blue);
            }

            this.checkLock(el.name);
        });

        this.ignoreUpdates = false;
    }

    /**
     * @param {String} label
     * @param {String} xml
     */
    updateElementXML(label, xml) {
        this.ignoreUpdates = true;
        this.evalXML(xml);
        this.evalCommand('UpdateConstruction()');
        this.ignoreUpdates = false;
    }

    checkLock(label) {
        this.applet.setFixed(label, true);
    }

    /**
     * This function grabs all objects in the construction, and sets a
     * lock on them if the username in the caption is not the current user.
     */
    checkLocks() {
        for (let i = 0; i < this.getObjectNumber(); i += 1) {
            const label = this.applet.getObjectName(i);
            this.checkLock(label);
        }
    }
}

window.ggbOnInit = GeogebraAdminView.globalInitHandler;

export default GeogebraAdminView;
