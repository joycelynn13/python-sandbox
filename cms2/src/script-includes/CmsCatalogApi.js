/**
 * CmsCatalogApi – thin bridge from Service Portal widget server scripts to the
 * read-only catalog module (src/server/cms-catalog.ts). No logic here.
 * NOTE: the module id contains the package version from package.json; keep in sync.
 */
var CmsCatalogApi = Class.create();
CmsCatalogApi.prototype = {
    initialize: function () {
        this._m = require('x_2317791_cms2/cms2/0.0.1/src/server/cms-catalog.ts');
    },
    getScale: function () { return this._m.getScale(); },
    getMyRoleProfile: function (userName) { return this._m.getMyRoleProfile(userName || gs.getUserName()); },
    browseRoleProfiles: function (filter) { return this._m.browseRoleProfiles(filter || {}); },
    getRoleProfile: function (id) { return this._m.getRoleProfile(id); },
    getLibrary: function (filter) { return this._m.getLibrary(filter || {}); },
    getElement: function (id) { return this._m.getElement(id); },
    getDomain: function (id) { return this._m.getDomain(id); },
    type: 'CmsCatalogApi'
};
