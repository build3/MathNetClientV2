/**
 * {StudentListener} is an adapter between Geogebra and server.
 * It dispatches/responds to events from the server related to manipulation
 * of Geogebra elements and workshops. It uses API provided by [StudentClient].
 */

import api from '../../../feathers-client';

// Geogebra does not support
// superscript. Therefore, we use
// Unicode to display them.
const numberToSuper = {
    0: '⁰',
    1: '¹',
    2: '²',
    3: '³',
    4: '⁴',
    5: '⁵',
    6: '⁶',
    7: '⁷',
    8: '⁸',
    9: '⁹',
};

const Consts = {
    // Ownership indicators
    UNASSIGNED: 'unassigned',
};

export default class StudentListener {
    /**
     * @param {Object} gbbClient Geogebra client object, see [StudentClient].
     * @param {String} studentUsername
     * @param {String} workshopId
     *
     * @param {Array[Number, Number, Number]} studentColor RGB color for
     * Geogebra elements.
     *
     * @param {Object} log Logger, for documentation see:
     * https://www.npmjs.com/package/vuejs-logger.
     */
    constructor(ggbClient, studentUsername, workshopId, studentColor, log) {
        this.client = ggbClient;
        this.studentUsername = studentUsername;
        this.workshopId = workshopId;
        this.initializeServerCallbacks();
        this.studentColor = studentColor;
        this.log = log;

        // Elements loaded from the server. [onAddElement] should not
        // be processed for those elements. Therefore, we need to keep
        // track of them.
        this.initialElements = new Set();

        // Claimed elements are the ones that have owners. For such elements,
        // we should avoid making updates to the server in [onUpdateElement].
        this.claimed = new Set();

        // Geogebra applet is emitting an 'update' event right after adding
        // the element (after the 'create' event).. For performance reasons,
        // we should ignore the update (it doesn't contain any change in
        // information).
        this.shouldUpdate = {};
    }

    /**
     * @param {String} workshopId ID of the workshop, corresponds in a 1:1
     * fashion with some group.
     * @param {String} ggbLabel Label (name) of the Geogebra element (object).
     * @return {String}
     */
    static getElementId(workshopId, ggbLabel) {
        return `${workshopId}-${ggbLabel}`;
    }

    /**
     * @param {String} label Geogebra element name.
     * @param {String} owner Owner of the element.
     */
    static getElementCaption(label, owner) {
        // To differenciate between duplicate names (when cycling A-Z),
        // a subscript number is added. For example, a sequence of As might
        // look like: A, A_1, A_2, A_3 and so on.
        const [name, sub] = label.split('_');
        // Turn subscript numbering into Unicode for superscript.
        const sup = (sub || '').split('').map(c => numberToSuper[c]).join('');

        // Final caption has numbering in superscript and owner in subscript.
        return `${name}${sup}_{${owner}}`;
    }

    static isUnassigned(label, caption) {
        console.log(label, caption, StudentListener.getElementCaption(label, Consts.UNASSIGNED), 'isUnnasigned');
        return caption === StudentListener.getElementCaption(label, Consts.UNASSIGNED);
    }

    isOwner(label, caption) {
        return caption === StudentListener.getElementCaption(label, this.studentUsername);
    }

    /**
     * Determines whether object is owned by the user or can be
     * claimed by him.
     */
    isMovable(label, caption) {
        return this.isOwner(label, caption) || StudentListener.isUnassigned(label, caption);
    }

    /**
     * Binds server events to local callbacks; load workshop meta-data
     * and elements and initializes applet.
     */
    initializeServerCallbacks() {
        // [onAppletReady] is called by [StudentClient] when applet finished
        // initializing.
        this.onAppletReady = async () => {
            api.service('elements').on('created', (element) => {
                this.log.debug('Created: ', element.name);
                this.claimed.add(element.name);
                this.client.setElement(element);
            });

            api.service('elements').on('patched', (element) => {
                this.log.debug('Patched: ', element.name);
                this.claimed.add(element.name);
                this.client.updateElementXML(element.name, element.xml);
            });

            api.service('elements').on('removed', (element) => {
                this.log.debug('Removed: ', element.name);
                this.client.deleteObject(element.name);
            });

            // Emitted when teacher sends construction to a workshop.
            api.service('workshops').on('updated', (workshop) => {
                this.log.debug('Workshop has changed', workshop);
                // Ignore updates if workshop is in the process of updating.
                // This is important because teacher will be sending unassigned
                // points. If a false positive on-update callback is issued
                // for unassigned point it will be automatically claimed.
                this.ignoreUpdates = workshop.updating;
            });

            // Load current state of the workshops.

            const workshops = await api.service('workshops').find({
                query: { id: this.workshopId },
            });

            const workshop = workshops[0];

            this.log.debug('Loaded workshop: ', workshop);

            if (workshop) {
                // Set initial construction based on the `xml` field.
                this.client.setConstruction(workshop.xml);

                // Load any existing elements in the workshop.
                const elements = await api.service('elements').find({
                    query: { workshop: workshop.id },
                }) || [];

                this.log.debug('Loaded elements:', elements);

                // Ignore on-update callbacks until initialization is complete.
                // Anything fired before that is considered false-positive.
                this.ignoreUpdates = true;

                /* eslint-disable-next-line no-restricted-syntax */
                for (const el of elements) {
                    this.initialElements.add(el.name);
                }

                this.client.setElements(elements);

                setTimeout(() => {
                    this.ignoreUpdates = false;
                });
            // Workshops was not created yet, create it.
            } else {
                // Create new workshop with the same id as the related group.
                const newWorkshop = await api.service('workshops').create({
                    id: this.workshopId,
                });

                this.log.debug('Created workshop: ', newWorkshop);
            }
        };
    }

    /**
     * @param {String} label Geogebra element name.
     */
    onUpdateElement(label) {
        if (this.ignoreUpdates) {
            return;
        }

        if (!this.shouldUpdate[label]) {
            this.shouldUpdate[label] = true;
            return;
        }

        this.log.debug(label);

        const id = StudentListener.getElementId(this.workshopId, label);
        const caption = this.client.getCaption(label);

        if (StudentListener.isUnassigned(label, caption)) {
            this.log.debug(`${label} is unassigned, claiming`);
            this.claimed.delete(label);
            this.adjustForDisplay(label);
        }

        if (!this.claimed.has(label)) {
            this.log.debug(label, id);

            setTimeout(() => {
                api.service('elements')
                    .patch(id, {
                        xml: this.client.getXML(label),
                        owner: this.studentUsername,
                    });
            }, 0);
        } else {
            this.client.checkLock(label);
        }
    }

    /**
     * Adjust caption and color of the element to differenciate between
     * elements of different students.
     */
    adjustForDisplay(label) {
        const caption = StudentListener.getElementCaption(label, this.studentUsername);
        this.client.setCaption(label, caption);
        this.client.setColor(label, this.studentColor);
    }

    /**
     * Callback on element added to the applet.
     */
    onAddElement(label) {
        if (!(this.initialElements.has(label) || this.claimed.has(label))) {
            this.log.debug(label);
            this.shouldUpdate[label] = false;
            this.adjustForDisplay(label);
            this.sendElement(label);
        }
    }

    /**
     * @param {String} label
     */
    async sendElement(label) {
        const element = {
            id: StudentListener.getElementId(this.workshopId, label),
            name: label,
            owner: this.studentUsername,
            workshop: this.workshopId,
            xml: this.client.getXML(label),
            obj_cmd_str: this.client.getCommandString(label, false),
        };

        this.log.debug(element);

        try {
            await api.service('elements').create(element);
        } catch (error) {
            this.log.error(error);
        }
    }

    onRemoveElement(label) {
        this.log.debug(label);

        api.service('elements').remove(
            StudentListener.getElementId(this.workshopId, label),
        );
    }
}
