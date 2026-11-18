api.controller = function () {
    var c = this;
    c.loading = false;
    c.sel = {};

    // Landing layout comes from Competency Group "Library Layout" (row | column), not from code.
    function arrange() {
        var lib = c.data.lib;
        c.rows = [];
        c.cols = [];
        if (!lib) return;
        angular.forEach(lib.groups, function (g) {
            (g.layout === 'row' ? c.rows : c.cols).push(g);
        });
    }

    if (c.data.dom) {
        // preselect the first defined level of each Element
        angular.forEach(c.data.dom.elements, function (e) {
            if (e.levels.length) c.sel[e.id] = e.levels[0].id;
        });
    } else {
        c.filter = angular.copy(c.data.filter);
        arrange();
    }

    c.shortName = function (g) {
        var i = g.name.lastIndexOf(' – ');
        return i > 0 ? g.name.substring(i + 3) : g.name;
    };
    c.elementCount = function (d) {
        return d.elements.length;
    };
    c.search = function () {
        c.loading = true;
        c.server.get({ filter: c.filter }).then(function (r) {
            c.data.lib = r.data.lib;
            arrange();
            c.loading = false;
        });
    };
    c.clear = function () {
        c.filter = { text: '', groupId: '', levelId: '' };
        c.search();
    };
    c.select = function (e, l) {
        c.sel[e.id] = l.id;
    };
    c.selected = function (e) {
        for (var i = 0; i < e.levels.length; i++) if (e.levels[i].id === c.sel[e.id]) return e.levels[i];
        return null;
    };
};
