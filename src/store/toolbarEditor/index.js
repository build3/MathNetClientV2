/* eslint-disable no-param-reassign */
import icons from './icons';

const SELECT_TOOLBAR = 'selectToolbar';
const CLEAR_TOOLBAR = 'clearToolbar';
const ADD_TOOLBAR = 'addToolbar';
const CLOSE_TOOLBAR = 'closeToolbar';
const SET_ALERT = 'setAlert';
const SHOW_ERROR = 'showError';

function emptyToolbar() {
    return Array.from(new Array(12), () => []);
}

// function parseTools(list) {
//     return list.split(' ').filter(s => s).map(s => icons.find(({ mode }) => s === mode));
// }
//
// function parseToolbar(toolbarString) {
//     return toolbarString.split('|').map(parseTools);
// }

function stringifyTools(list) {
    return list.map(({ mode }) => mode).join(' ');
}

function stringifyToolbar(toolbar) {
    return toolbar.map(stringifyTools).join('|');
}

const state = {
    selectedToolbars: [],
    currentToolbar: emptyToolbar(),
    addMode: false,
    addToolbarName: null,
    alert: null,
};

const getters = {
    toolbars: (_, __, ___, { 'users/current': { toolbars } }) => toolbars,

    teacher: (_, __, ___, { 'users/current': teacher }) => teacher,

    icons: () => icons,

    canDelete: ({ selectedToolbars: { length } }) => length > 0,

    toolbarString: ({ currentToolbar }) => stringifyToolbar(currentToolbar),

    currentToolbar: ({ currentToolbar }) => currentToolbar,

    addToolbarName: ({ addToolbarName }) => addToolbarName,

    selectedToolbars: ({ selectedToolbars }) => selectedToolbars,
};

const actions = {
    useToolbar: ({ state: { selectedToolbars }, getters: { toolbars }, commit }) => {
        const { length } = selectedToolbars;
        if (length === 0) {
            return;
        }

        const [selectedName] = this.selectedToolbars;
        const toolbar = toolbars.find(({ name }) => name === selectedName);

        if (!toolbar) {
            return;
        }

        commit(SELECT_TOOLBAR, toolbar);
    },

    deleteTool: ({ commit, getters: { currentToolbar } }, { listNumber, elementNumber }) => {
        const toolbar = [...currentToolbar];
        const list = toolbar[listNumber];
        list.splice(elementNumber, 1);
        toolbar[listNumber] = list;

        commit(SELECT_TOOLBAR, toolbar);
    },

    sendToolbars: async ({ getters: { teacher }, dispatch }, toolbars) => {
        await dispatch('users/patch', [
            teacher.username, {
                toolbars,
            },
        ], { root: true });
    },

    saveToolbar: async ({
        commit,
        dispatch,
        getters: {
            toolbars, addToolbarName, toolbarString,
        },
    }) => {
        commit(SET_ALERT, null);

        if (toolbars.find(({ name }) => name === addToolbarName)) {
            commit(SHOW_ERROR,
                'Toolbar with this name already exists. Cancelling overwrite.');
            return;
        }

        const toolbar = {
            name: addToolbarName,
            tools: toolbarString,
        };

        try {
            await dispatch('sendToolbars', [...(toolbars || []), toolbar]);
        } catch ({ message }) {
            commit(SHOW_ERROR, message);
        }

        commit(CLOSE_TOOLBAR);
    },

    deleteToolbar: async ({ commit, dispatch, getters: { toolbars, selectedToolbars } }) => {
        const list = toolbars.filter(
            ({ name }) => selectedToolbars.includes(name),
        );

        try {
            await dispatch('sendToolbars', list);
        } catch ({ message }) {
            commit(SHOW_ERROR, message);
        }
    },

    closeToolbar: ({ commit }) => {
        commit(CLOSE_TOOLBAR);
    },

    clearToolbar: ({ commit }) => {
        commit(CLEAR_TOOLBAR);
    },
};

const mutations = {
    [SELECT_TOOLBAR]: (s, toolbar) => {
        s.currentToolbar = toolbar;
    },

    [CLEAR_TOOLBAR]: (s) => {
        s.currentToolbar = emptyToolbar();
    },

    [ADD_TOOLBAR]: (s) => {
        s.addMode = true;
    },

    [CLOSE_TOOLBAR]: (s) => {
        s.addMode = false;
    },

    [SET_ALERT]: (s, alert) => {
        s.alert = alert;
    },

    [SHOW_ERROR]: (s, message) => {
        s.alert = { type: 'danger', message };
    },
};

export default {
    namespaced: true,

    state,
    getters,
    actions,
    mutations,
};
