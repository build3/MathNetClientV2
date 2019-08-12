import Consts from './Consts';
import GeogebraAdminView from './GeogebraAdminView';
import feathersClient from '../../feathers-client';

const api = feathersClient;

export default class {
    constructor(groups, params) {
        this.groups = groups;

        this.params = {
            ...Consts.DEFAULT_PARAMS,
            width: 600,
            height: 600,
            perspective: 'G',
            showMenubar: false,
            showToolbar: false,
            preventFocus: true,
            ...params,
        };

        this.log = this.params.log;

        this.multiParams = this.groups.map(g => ({
            // eslint-disable-next-line no-underscore-dangle
            container: `ggb_applet_${g._id}`,
            // eslint-disable-next-line no-underscore-dangle
            id: `ggb_applet_${g._id}`,
            // eslint-disable-next-line no-underscore-dangle
            groupId: g._id,
            ...this.params,
        }));

        this.GAVs = this.multiParams.map(p => new GeogebraAdminView(p, p.groupId, this));

        // eslint-disable-next-line no-underscore-dangle
        this.workshopIds = this.groups.map(g => g._id);
    }

    inject() {
        this.initListener();

        this.GAVs.forEach((GAV) => {
            GAV.inject();
        });
    }

    initListener() {
        this.log.debug('initListener');

        api.service('elements').on('created', (element) => {
            const index = this.workshopIds.indexOf(element.workshop);

            if (index !== -1) {
                this.GAVs[index].setElement(element);
            }
        });

        api.service('elements').on('patched', (element) => {
            const index = this.workshopIds.indexOf(element.workshop);

            if (index !== -1) {
                this.GAVs[index].updateElementXML(element.name, element.xml);
            }
        });

        api.service('elements').on('removed', (element) => {
            const index = this.workshopIds.indexOf(element.workshop);

            if (index !== -1) {
                this.GAVs[index].deleteObject(element.name);
            }
        });

        api.service('workshops').on('xml-changed', (workshop) => {
            this.log.debug('XML-changed', workshop);
            const index = this.workshopIds.indexOf(workshop.id);

            if (index !== -1) {
                this.GAVs[index].setXML(workshop.xml);
            }
        });
    }
}
