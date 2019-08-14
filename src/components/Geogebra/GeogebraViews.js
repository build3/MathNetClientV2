import GeogebraAdminView from './GeogebraAdminView';
import GeogebraMergedAdminView from './GeogebraMergedAdminView';
import feathersClient from '../../feathers-client';

const api = feathersClient;

export default class {
    constructor(groups, params) {
        this.groups = groups;

        this.params = {
            width: 600,
            height: 600,
            perspective: 'G',
            // showAlgebraInput: false,
            showToolBarHelp: false,
            showMenubar: false,
            enableLabelDrags: false,
            showResetIcon: false,
            showToolbar: false,
            allowStyleBar: false,
            useBrowserForJS: true,
            enableShiftDragZoom: true,
            errorDialogsActive: true,
            enableRightClick: false,
            enableCAS: false,
            enable3d: false,
            isPreloader: false,
            screenshotGenerator: false,
            preventFocus: true,
            log: undefined,
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
            const pos = this.workshopIds.indexOf(element.workshop);
            if (pos !== -1) {
                this.GAVs[pos].setElement(element);
            }
        });

        api.service('elements').on('patched', (element) => {
            const pos = this.workshopIds.indexOf(element.workshop);
            if (pos !== -1) {
                this.GAVs[pos].updateElementXML(element.name, element.xml);
            }
        });

        api.service('workshops').on('xml-changed', (workshop) => {
            const pos = this.workshopIds.indexOf(workshop.id);
            if (pos !== -1) {
                this.GAVs[pos].setXML(workshop.xml);
            }
        });

        api.service('workshops').on('created', (workshop) => {
            console.log('Workshop created', workshop);
        });
    }

    mergeViews(workshopIds, params) {
        this.mergedView = new GeogebraMergedAdminView({
            container: 'merged_ggb_applet',
            id: 'merged_ggb_applet',
            perspective: 'G',
            ...params,
        }, workshopIds);
        this.mergedView.inject();
    }

    mergeGoLive() {
        this.log.debug('Going live');
    }

    mergeStopLive() {
        this.log.debug('Stopping live');
    }
}
