/**
 * CmsAdminActions – thin bridge from UI Actions to the versioning/validation
 * modules (src/server/cms-rules.ts → actions). No logic here.
 * NOTE: the module id contains the package version from package.json; keep in sync.
 */
var CmsAdminActions = Class.create();
CmsAdminActions.prototype = {
    initialize: function () {
        this._a = require('x_2317791_cms2/cms2/0.0.1/src/server/cms-rules.ts').actions;
    },
    publish: function (current) { return this._a.publish(current); },
    retire: function (current) { return this._a.retire(current); },
    createNewVersion: function (current) { return this._a.createNewVersion(current); },
    validateRoleProfile: function (current) { return this._a.validateRoleProfile(current); },
    type: 'CmsAdminActions'
};
