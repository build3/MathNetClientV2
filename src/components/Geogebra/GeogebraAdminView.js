import BaseGeogebraClient from './BaseGeogebraClient';
import Consts from './Consts';
import feathersClient from '../../feathers-client';

const api = feathersClient;

class GeogebraAdminView extends BaseGeogebraClient {
    constructor(params, workshopId) {
        super();
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

        this.ignoreUpdates = false;
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

    checkLock(label) {
        this.applet.setFixed(label, true);
    }
}

export default GeogebraAdminView;
