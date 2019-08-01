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
    constructor(params, workshopId) {
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
        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);
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

    static globalInitHandler(applet) {
        console.log(`Initializing ${applet}`);
        GeogebraAdminView.initRegistry();
        if (GeogebraAdminView.appletRegistry[applet]) {
            console.log(`${applet} has callbacks`);
            GeogebraAdminView.appletRegistry[applet](applet);
        } else {
            console.log(`Could not find applet for ID ${applet}`);
        }
    }

    inject() {
        this.appletContainer.inject(this.params.container, 'auto');
    }

    ggbOnInit() {
        this.applet = this.appletContainer.getAppletObject();
        // this.registerGlobalListeners();
        this.isInitialized = true;
        /* $(window).resize(() => {
            this.applet.setHeight($(window).height() / 1.3);
        }); */
        // if (this.listener) this.listener.ggbOnInit(applet);
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
        api.service('elements').on('created', (element) => {
            console.log('Element created', element);
            this.setElement(element);
        });

        api.service('elements').on('patched', (element) => {
            console.log('Element patched', element);
            this.updateElementXML(element.name, element.xml);
        });

        api.service('workshops').on('xml-changed', (workshop) => {
            console.log('Workshop xml changed', workshop);
            this.setXML(workshop.xml);
        });

        api.service('workshops').on('created', (workshop) => {
            console.log('Workshop created', workshop);
        });

        // Load current state of the workshops.

        // eslint-disable-next-line prefer-const
        let [workshop, ...rest] = await api.service('workshops').find({
            query: { id: this.workshopId },
        });

        console.log('Loaded workshop: ', workshop);
        console.log('Rest is: ', rest);
        console.log('API', api);

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
        // this.evalCommand('UpdateConstruction()');
        this.checkLocks();
        this.ignoreUpdates = false;
    }

    /**
     * @param {Object} element
     */
    setElement(element) {
        console.log(element);

        this.ignoreUpdates = true;

        if (element.obj_cmd_str !== '') {
            // TODO: Explain this
            const command = Consts.getCommand(element.name, element.obj_cmd_str);
            this.evalCommand(command);
        }

        this.evalXML(element.xml);
        this.checkLock(element.name);
        // this.evalCommand('UpdateConstruction()');

        this.ignoreUpdates = false;
    }

    /**
     * @param {Array[Object]} elements
     */
    setElements(elements) {
        console.log(elements);

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

            if (el.colors) {
                const [red, green, blue] = el.colors;
                this.setColor(el.name, red, green, blue);
            }

            this.checkLock(el.name);
        });

        // this.evalCommand('UpdateConstruction()');
        this.ignoreUpdates = false;
    }

    /**
     * @param {String} label
     * @param {String} xml
     */
    updateElementXML(label, xml) {
        console.log('Updating element', label);

        this.ignoreUpdates = true;
        this.evalXML(xml);
        // this.applet.evalCommand("UpdateConstruction()");
        this.ignoreUpdates = false;
    }

    checkLock(label) {
        console.log('checkLock', label);

        const caption = this.applet.getCaption(label);
        const username = undefined;
        const objType = this.applet.getObjectType(label);
        const uCaption = `${label}_{${username}}`;
        const unassignedCaption = `${label}_{unassigned}`;

        // User is the owner of the object.
        if (caption === uCaption || caption === unassignedCaption) {
            if (objType === Consts.NUMERIC || objType === Consts.TEXTFIELD) {
                this.applet.setFixed(label, false,
                    /* is selection allowed */
                    true);
            } else { this.applet.setFixed(label, false); }

        // Someone else is the owner of the object.
        } else if (uCaption !== caption) {
            if (objType === Consts.NUMERIC || objType === Consts.TEXTFIELD) {
                this.applet.setFixed(label, true,
                    /* is selection allowed */
                    false);
            } else {
                this.applet.setFixed(label, true);
            }
        }
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
