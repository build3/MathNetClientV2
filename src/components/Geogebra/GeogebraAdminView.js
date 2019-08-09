import Consts from './Consts';
import feathersClient from '../../feathers-client';

const api = feathersClient;

class GeogebraAdminView {
    constructor(params, workshopId /* geogebraViewsParent */) {
        this.params = {
            ...Consts.DEFAULT_PARAMS,
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

export default GeogebraAdminView;
