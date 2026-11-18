api.controller = function () {
    var c = this;
    c.filter = angular.copy(c.data.filter);
    c.collapsed = {};
    c.loading = false;
    c.search = function () {
        c.loading = true;
        c.server.get({ filter: c.filter }).then(function (r) {
            c.data.lib = r.data.lib;
            c.loading = false;
        });
    };
    c.toggle = function (domainId) {
        c.collapsed[domainId] = !c.collapsed[domainId];
    };
    c.clear = function () {
        c.filter = { text: '', groupId: '', levelId: '' };
        c.search();
    };
};
