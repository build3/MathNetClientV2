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

class PendingRenames {
    constructor(groupId) {
        this.groupId = groupId;
        this.expectedAddCallbacks = 0;
        this.expectedNetworkPoints = 0;
        this.receivedAdds = [];
        this.receivedNetworkPoints = [];
    }
}

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
        this.activePending = undefined;
        this.pendingRenames = [];
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
        this.applet.setOnTheFlyPointCreationActive(false);
        window[`addListener${this.params.id}`] = label => this.onAddElement(label);
        this.isInitialized = true;
        this.loadWorkshops();

        this.centerView();
    }

    onAddElement(label) {
        if (this.applet.getObjectType(label) === 'point'
            && this.activePending && this.activePending.expectedAddCallbacks > 0) {
            this.activePending.receivedAdds = [...this.activePending.receivedAdds, label];
            this.maybeRenamePoints(this.activePending.groupId);
        }
    }

    maybeRenamePoints(groupId) {
        // const pending = this.pendingRenames.find(r => r.groupId === groupId);
        // if (pending.receivedAdds.length > 0 && pending.receivedNetworkPoints.length > 0) {
        //     // do the rename
        //     this.applet.setCaption(pending.receivedAdds[0], pending.receivedNetworkPoints[0]);
        //     pending.receivedAdds = pending.receivedAdds.slice(1);
        //     pending.receivedNetworkPoints = pending.receivedNetworkPoints.slice(1);
        //     this.maybeRenamePoints(groupId);
        // } else {
        //     console.log(`Points generated length ${pending.receivedAdds.length} and `
        //     + `points renamed length ${pending.receivedNetworkPoints.length} for group ${groupId}`);
        // }
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

    evalCommandGetLabels(command) {
        // Despite what the docs say, this doesn't return a String[], it returns a
        // comma-separated string.
        const result = this.applet.evalCommandGetLabels(command);
        if (result) {
            return result.split(',');
        } else {
            return [];
        }
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

            api.service('elements')
                .on('created', this.createdListener);
            api.service('elements')
                .on('patched', this.patchedListener);
            api.service('elements')
                .on('removed', this.removedListener);
            // api.service('workshops').on('xml-changed', this.xmlChangedListener);
        };

        this.clearListeners = () => {
            api.service('elements')
                .removeListener('created', this.createdListener);
            api.service('elements')
                .removeListener('patched', this.patchedListener);
            api.service('elements')
                .removeListener('removed', this.removedListener);
            // api.service('workshops').removeListener('xml-changed', this.xmlChangedListener);
        };
    }

    getHeight() {
        const xml = this.applet.getXML();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // eslint-disable-next-line radix
        return parseInt(windowTag.getAttribute('height'));
    }

    getWidth() {
        const xml = this.applet.getXML();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const windowTag = xmlDoc.getElementsByTagName('window')[0];
        // eslint-disable-next-line radix
        return parseInt(windowTag.getAttribute('width'));
    }

    // noinspection DuplicatedCode
    processAdditionalXmlAttributes(xml, properties = {}) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        if (properties.perspective) {
            this.applet.setPerspective(properties.perspective);
        } else {
            this.applet.setPerspective('G');
        }

        this.applet.enableShiftDragZoom(false);

        const evSettings = xmlDoc.getElementsByTagName('evSettings')[0];
        this.applet.setGridVisible(evSettings.getAttribute('grid') === 'true');
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
            const targetAspectRatio = width / (height + 53); // add 53 to account for menu bar
            const existingAspectRatio = this.getWidth() / this.getHeight();

            //maybe leave width alone?
            //this.applet.setWidth(this.getWidth() * (targetAspectRatio / existingAspectRatio));
            this.applet.setHeight(this.getHeight() * (existingAspectRatio / targetAspectRatio));
            // now set the coordinate system
            console.log(`${constructionXZero}, ${constructionYZero} -- ${constructionScale}, ${constructionYScale}`);
            this.applet.setCoordSystem(constructionXZero,
                (viewProps.width / constructionScale) + constructionXZero,
                constructionYZero,
                (viewProps.height / constructionYScale) + constructionYZero);
        }
    }

    // Load current state of the workshops.
    async loadWorkshopState(workshopId, iter) {
        // eslint-disable-next-line prefer-const
        let [workshop, ...rest] = await api.service('workshops')
            .find({
                query: { id: workshopId },
            });

        this.log.debug('Loaded workshop: ', workshop);
        this.log.debug('Rest is: ', rest);
        // this.log.debug('API', api);

        this.processAdditionalXmlAttributes(workshop.xml, workshop.properties);

        if (workshop) {
            // Set initial construction based on the `xml` field.
            // this.setConstruction(workshop.xml, workshop.id);

            // Load any existing elements in the workshop.
            const elements = await api.service('elements')
                .find({
                    query: { workshop: workshop.id },
                }) || [];

            this.log.debug(`Loaded elements for workshop[${iter}]:`, elements);

            this.setElements(
                elements,
                iter,
            );
            // Workshops was not created yet, create it.
        } else {
            workshop = await api.service('workshops')
                .create({
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
     * @param {array} additionalElements
     */
    setElement(element, additionalElements = []) {
        this.log.debug(element);

        this.ignoreUpdates = true;

        if (element.obj_cmd_str && element.obj_cmd_str !== '') {
            // TODO: Explain this
            const command = element.obj_cmd_str;
            // Consts.getCommand(element.name, element.obj_cmd_str);
            let labels = this.evalCommandGetLabels(command);
            labels = labels.filter(l => this.applet.getCommandString(l) === element.obj_cmd_str.replace('[', '(')
                .replace(']', ')'));
            // eslint-disable-next-line no-param-reassign
            if (additionalElements.length > 0 && labels.length > 0) {
                // right now assume they're the same length, could cause problems though
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < additionalElements.length; ++i) {
                    if (labels[i].indexOf('grp') === -1) {
                        const generatedObject = labels[i];
                        const newLabel = additionalElements[i].label;
                        const newCaption = additionalElements[i].caption;
                        this.applet.renameObject(generatedObject, newLabel);
                        this.applet.setCaption(newLabel, newCaption);
                    }
                }
            }
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

    static getRequiredPoints(commandStr) {
        // Don't know what the official allowed characters are
        // but this seems to match (if not be overly broad)
        const regex = /^([^[]+)\[(.+), ([0-9]+)]$/;
        const match = commandStr.match(regex);
        if (match && match) {
            // e.g. Polygon[F_1,G_1,4] will create two additional points plus the polygon, so
            // waiting for three total elements to be created
            return parseInt(match[3], 0) - match[2].split(',').length + 1;
        } else {
            return 0;
        }
    }

    addElementAfterRenameToMergedGroupNotation(element, groupNum) {
        const objLabel = element.name;
        const objXML = element.xml;
        const objCmdStr = element.obj_cmd_str;
        let additionalPoints = element.additional_points || [];

        const requiredPoints = GeogebraMergedAdminView.getRequiredPoints(objCmdStr);
        if (requiredPoints === 0 || additionalPoints.length === requiredPoints) {
            // we have all of the points
            if (additionalPoints.length > 0) {
                additionalPoints = additionalPoints.map(p => ({
                    ...p,
                    label: `${p.label}grp${groupNum + 1}`,
                }));
            }

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

            // // TODO, generalize this if it works
            // if (newObjCmdStr.indexOf('Polygon') !== -1) {
            //     newObjCmdStr = '';
            // }
            this.setElement(
                {
                    name: newLabel,
                    xml: newXML,
                    obj_cmd_str: newObjCmdStr,
                }, additionalPoints,
            );
        } else {
            this.log.debug(`Not sending create for ${objLabel} ${objCmdStr} `);
        }
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
            indices.push({
                index: result.index + result[0].length,
                variable: result[0],
            });
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
        this.applet.getAllObjectNames()
            .forEach((obj) => {
                this.applet.deleteObject(obj);
            });
    }

    centerView() {
        this.evalCommand('CenterView[(0,0)]');
    }
}

export default GeogebraMergedAdminView;
