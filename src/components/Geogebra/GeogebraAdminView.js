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
            log: undefined,
            ...params,
        };

        this.log = this.params.log;

        this.workshopId = workshopId;

        GeogebraAdminView.registerApplet(this.params.id, this.ggbOnInit.bind(this));

        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);

        window.ggbOnInit = GeogebraAdminView.globalInitHandler;

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
        this.log.debug();
        this.applet = this.appletContainer.getAppletObject();
        this.isInitialized = true;

        this.onAppletReady();
        this.centerView();
    }

    getXML() {
        return this.applet.getXML();
    }

    setXML(xml) {
        this.applet.setXML(xml);
        this.checkLocks();
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

    centerView() {
        this.evalCommand('CenterView[(0,0)]');
    }

    // noinspection DuplicatedCode
    static processAdditionalXmlAttributes(xml, properties = {}, applet) {

        const getHeight = () => {
            const xml = applet.getXML();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');
            const windowTag = xmlDoc.getElementsByTagName('window')[0];
            // eslint-disable-next-line radix
            return parseInt(windowTag.getAttribute('height'));
        };

        const getWidth = () => {
            const xml = applet.getXML();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'text/xml');
            const windowTag = xmlDoc.getElementsByTagName('window')[0];
            // eslint-disable-next-line radix
            return parseInt(windowTag.getAttribute('width'));
        };

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        if (properties.perspective) {
            applet.setPerspective(properties.perspective);
        } else {
            applet.setPerspective('G');
        }

        applet.enableShiftDragZoom(false);

        const evSettings = xmlDoc.getElementsByTagName('evSettings')[0];
        applet.setGridVisible(evSettings.getAttribute('grid') === 'true');
        // then force the same aspect ratio as the teacher
        const coordSystemTag = xmlDoc.getElementsByTagName('coordSystem')[0];
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // calc ratio of current width to teacher width
        if (properties.view) {
            // noinspection DuplicatedCode
            const viewProps = JSON.parse(properties.view);
            const constructionXZero = viewProps.xMin;
            const constructionYZero = viewProps.yMin;
            // eslint-disable-next-line max-len
            const constructionScale = parseFloat(coordSystemTag.getAttribute('scale'));
            // eslint-disable-next-line max-len
            const constructionYScale = parseFloat(coordSystemTag.getAttribute('yscale'));
            const width = parseInt(windowTag.getAttribute('width'), 10);
            const height = parseInt(windowTag.getAttribute('height'), 10);
            const targetAspectRatio = width / (height - 53); // subtract 53 to account for toolbar
            const existingAspectRatio = getWidth() / getHeight();

            //maybe leave width alone?
            // applet.setWidth(getWidth() * (targetAspectRatio / existingAspectRatio));
            // applet.setHeight(getHeight() * (existingAspectRatio / targetAspectRatio));
            // now set the coordinate system
            console.log(`${constructionXZero}, ${constructionYZero} -- ${constructionScale}, ${constructionYScale}`);
            applet.setCoordSystem(constructionXZero,
                (viewProps.width / constructionScale) + constructionXZero,
                constructionYZero,
                (viewProps.height / constructionYScale) + constructionYZero);
        }
    }

    async onAppletReady() {
        this.log.debug();
        // Load current state of the workshops.

        // eslint-disable-next-line prefer-const
        let [workshop, ...rest] = await api.service('workshops').find({
            query: { id: this.workshopId },
        });

        console.log('Workshop, rest', workshop, rest);

        if (workshop) {
            // Set initial construction based on the `xml` field.
            this.setConstruction(workshop.xml);
            GeogebraAdminView.processAdditionalXmlAttributes(workshop.xml, workshop.properties, this.applet);

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

    deleteObject(label) {
        this.applet.deleteObject(label);
    }
}

export default GeogebraAdminView;
