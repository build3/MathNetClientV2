import GeogebraAdminView from './GeogebraAdminView';

export default class {
    constructor(groups, params) {
        // console.log('Hello', workshops);
        this.groups = groups;

        this.params = {
            width: 300,
            height: 300,
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
            ...params,
        };

        console.log('this.groups:', this.groups);

        this.multiParams = this.groups.map(g => ({
            // eslint-disable-next-line no-underscore-dangle
            container: `ggb_applet_${g._id}`,
            // eslint-disable-next-line no-underscore-dangle
            id: `ggb_applet_${g._id}`,
            // eslint-disable-next-line no-underscore-dangle
            groupId: g._id,
            ...this.params,
        }));

        this.GAVs = this.multiParams.map(p => new GeogebraAdminView(p, p.groupId));

        console.log('constructor end');
    }

    inject() {
        console.log('inject', this.GAVs);

        for (let i = 0; i < this.GAVs.length; i += 1) {
            this.GAVs[i].inject();
        }
    }
}
