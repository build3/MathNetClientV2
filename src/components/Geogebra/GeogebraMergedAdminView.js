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

class GeogebraMergedAdminView {
    constructor(params, workshopIds) {
        this.params = {
            showAlgebraInput: true,
            showToolBarHelp: false,
            showMenubar: true,
            enableLabelDrags: false,
            showResetIcon: true,
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
            preventFocus: false,
            ...params,
        };

        this.log = this.params.log;

        this.workshopIds = workshopIds;
        this.initializeReactionsToServerEvents();
        // eslint-disable-next-line no-undef
        this.appletContainer = new GGBApplet(this.params);
    }

    inject(callback) {
        window.ggbOnInit = () => {
            this.ggbOnInit();
            callback();
        };

        this.appletContainer.inject(this.params.container, 'auto');
    }

    ggbOnInit() {
        this.applet = this.appletContainer.getAppletObject();
        this.isInitialized = true;
        this.loadWorkshops();

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

    /**
     * Binds server events to local callbacks; load workshop meta-data
     * and elements and initializes applet.
     */
    initializeReactionsToServerEvents() {
        // [onAppletReady] is called by [StudentClient] when applet finished
        // initializing.
        this.loadWorkshops = async () => {
            this.log.debug('loadWorkshops');

            await this.workshopIds.map(
                async (workshopId, iter) => this.loadWorkshopState(workshopId, iter),
            );

            this.log.debug('this.workshopIds', this.workshopIds);
        };

        this.initializeCallbacks = async () => {
            this.log.debug('Loading initializeCallbacks');

            this.createdListener = (element) => {
                const pos = this.workshopIds.indexOf(element.workshop);
                if (pos !== -1) {
                    this.log.debug('Element created', element);
                    this.addElementAfterRenameToMergedGroupNotation(element, pos);
                }
            };

            this.patchedListener = (element) => {
                const pos = this.workshopIds.indexOf(element.workshop);
                if (pos !== -1) {
                    this.log.debug('Element patched', element);
                    this.updateElementAfterRenameToMergedGroupNotation(element, pos);
                }
            };

            this.removedListener = (element) => {
                const pos = this.workshopIds.indexOf(element.workshop);
                if (pos !== -1) {
                    this.log.debug('Element removed', element);
                    this.applet.deleteObject(`${element.name}grp${pos + 1}`);
                }
            };

            /* this.xmlChangedListener = (workshop) => {
                if (this.workshopIds.indexOf(workshop.id) !== -1) {
                    this.log.debug('Workshop xml changed', workshop);
                    this.setXML(workshop.xml);
                }
            }; */

            api.service('elements').on('created', this.createdListener);
            api.service('elements').on('patched', this.patchedListener);
            api.service('elements').on('removed', this.removedListener);
            // api.service('workshops').on('xml-changed', this.xmlChangedListener);
        };

        this.clearListeners = () => {
            api.service('elements').removeListener('created', this.createdListener);
            api.service('elements').removeListener('patched', this.patchedListener);
            api.service('elements').removeListener('removed', this.removedListener);
            // api.service('workshops').removeListener('xml-changed', this.xmlChangedListener);
        };
    }

    // Load current state of the workshops.
    async loadWorkshopState(workshopId, iter) {
        // eslint-disable-next-line prefer-const
        let [workshop, ...rest] = await api.service('workshops').find({
            query: { id: workshopId },
        });

        this.log.debug('Loaded workshop: ', workshop);
        this.log.debug('Rest is: ', rest);
        // this.log.debug('API', api);

        if (workshop) {
            // Set initial construction based on the `xml` field.
            // this.setConstruction(workshop.xml, workshop.id);

            // Load any existing elements in the workshop.
            const elements = await api.service('elements').find({
                query: { workshop: workshop.id },
            }) || [];

            this.log.debug(`Loaded elements for workshop[${iter}]:`, elements);

            this.setElements(
                elements,
                iter,
            );
        // Workshops was not created yet, create it.
        } else {
            workshop = await api.service('workshops').create({
                id: workshopId,
            });

            this.log.debug(`Created workshop[${iter}]: `, workshop);
        }
    }

    setConstruction(xml) {
        this.ignoreUpdates = true;
        this.evalXML(xml);
        this.checkLocks();
        this.ignoreUpdates = false;
    }

    /**
     * @param {Object} element
     */
    setElement(element) {
        this.log.debug(element);

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
    setElements(elements, groupNum) {
        this.log.debug('Elements ', elements);

        this.ignoreUpdates = true;

        elements.forEach((el) => {
            // Before adding to merged view, elements have to be renamed.
            // Their labels, xml_obj and obj_cmd_str are subject to change.
            // At the end of labels ocurring in these three components there is
            // `grp${groupNum+1}` added
            this.addElementAfterRenameToMergedGroupNotation(el, groupNum);
        });

        this.ignoreUpdates = false;
    }

    /**
     * @param {String} label
     * @param {String} xml
     */
    updateElementXML(label, xml) {
        this.log.debug('Updating element', label);

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

    /**
     * Assign caption (display name) to single Geogebra element.
     *
     * @param {String} label
     * @param {String} caption
     */
    setCaption(label, caption) {
        this.ignoreUpdates = true;

        // Configure element to display caption as its display name.
        this.applet.setLabelStyle(label, Consts.CAPTION_STYLE);
        this.applet.setCaption(label, caption);

        this.ignoreUpdates = false;
    }

    /**
     * @param {String} label Geogebra element name
     * @param {Array[Number, Number, Number]} color RGB color
     */
    setColor(label, [red, green, blue]) {
        this.applet.setColor(label, red, green, blue);
    }

    addElementAfterRenameToMergedGroupNotation(element, groupNum) {
        const objLabel = element.name;
        const objXML = element.xml;
        const objCmdStr = element.obj_cmd_str;


        let objLabels = this.applet.getAllObjectNames();
        // filtering by labels that have this specific group suffix `grp${groupNum + 1}`
        objLabels = objLabels.filter((label) => {
            const regex = RegExp(`grp${groupNum + 1}$`, 'g');
            const matches = (regex.exec(label) !== null);
            // this.log.debug('Label ', label,
            // `(groupNum + 1) ${groupNum + 1}`, ' matches?', matches);
            return matches;
        });

        this.log.debug('matched objLabels', objLabels);

        // new label
        const newLabel = `${objLabel}grp${groupNum + 1}`;
        // production of newXML (with changed label inside its code)
        const newXML = GeogebraMergedAdminView.produceXMLWithNewLabel(
            objLabel,
            objXML,
            groupNum,
        );
        // new command string, with all variables renamed to `grp${groupNum + 1}` suffix
        const newObjCmdStr = GeogebraMergedAdminView.produceNewCmdStr(
            objCmdStr,
            objLabels,
            groupNum,
        );

        this.setElement(
            {
                name: newLabel,
                xml: newXML,
                obj_cmd_str: newObjCmdStr,
            },
        );
    }

    updateElementAfterRenameToMergedGroupNotation(element, groupNum) {
        const objLabel = element.name;
        const objXML = element.xml;

        // new label
        const newLabel = `${objLabel}grp${groupNum + 1}`;
        // production of newXML (with changed label inside its code)
        const newXML = GeogebraMergedAdminView.produceXMLWithNewLabel(
            objLabel,
            objXML,
            groupNum,
        );

        this.updateElementXML(newLabel, newXML);
    }

    static produceXMLWithNewLabel(objLabel, objXML, groupNum) {
        // searching for occurences of  <element blabla label="sth">
        // eslint-disable-next-line no-useless-escape
        const regex = RegExp(`^\<element.*label\=\"${objLabel}\"\>`, 'g');
        const magicOffset = -2; // to take whats before "> in this regex

        let newObjXML = objXML;
        // this.log.debug('objXML', objXML);

        let result = {};
        const indices = [];
        let varRes = {};

        // searching for occurences of <element blabla label="sth">
        // eslint-disable-next-line no-cond-assign
        while (result = regex.exec(newObjXML)) {
            // this.log.debug('Result is', result);
            indices.push({
                index: result.index + result[0].length + magicOffset,
                variable: result[0],
            });
        }
        // this.log.debug('indices', indices);

        // morphing string
        // eslint-disable-next-line no-cond-assign
        while (varRes = indices.pop()) {
            if (varRes === null) break;
            newObjXML = `${newObjXML.slice(0, varRes.index)}grp${groupNum + 1}${newObjXML.slice(varRes.index)}`;
            // this.log.debug('newObjXML', newObjXML);
        }

        // this.log.debug('newObjXML', newObjXML);
        return newObjXML;
    }

    static produceNewCmdStr(cmdStr, objLabels, groupNum) {
        // const regex = /[A-Z]+(?![a-z])|^[A-Z]*[a-z]+[0-9]*(?![a-zA-Z])/g; // old regex

        // eslint-disable-next-line no-useless-escape
        const regex = RegExp('[A-Za-zα-ωΑ-Ω][A-Za-zα-ωΑ-Ω0-9\^\_\{\}]*(?![A-Za-zα-ωΑ-Ω0-9\^\_\{\}\[\(])', 'g');

        let objCmdStr = cmdStr;

        let result = {};
        const indices = [];
        let varRes = {};

        // taking all possible-to-be variables

        // eslint-disable-next-line no-cond-assign
        while (result = regex.exec(objCmdStr)) {
            // this.log.debug('Result is', result);
            indices.push({ index: result.index + result[0].length, variable: result[0] });
        }

        // taking these possible-to-be variables
        // and filtering by occurence in objLabels
        // if variable is on the list, let's rename it!

        // eslint-disable-next-line no-cond-assign
        while (varRes = indices.pop()) {
            if (varRes === null) break;

            const { index, variable } = varRes;

            if (objLabels.includes(`${variable}grp${groupNum + 1}`)) {
                objCmdStr = `${objCmdStr.slice(0, index)}grp${groupNum + 1}${objCmdStr.slice(index)}`;
            }
        }

        // this.log.debug('objCmdStr', objCmdStr);

        return objCmdStr;
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

    centerView() {
        this.evalCommand('CenterView[(0,0)]');
    }
}

export default GeogebraMergedAdminView;