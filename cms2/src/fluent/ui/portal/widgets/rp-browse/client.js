api.controller = function () {
    var c = this;
    c.filter = angular.copy(c.data.filter);
    c.loading = false;
    c.search = function () {
        c.loading = true;
        c.server.get({ filter: c.filter }).then(function (r) {
            c.data.result = r.data.result;
            c.loading = false;
        });
    };
    c.clear = function () {
        c.filter = { text: '', businessFunction: '', jobFamily: '', jobTitle: '' };
        c.search();
    };
};
