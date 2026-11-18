api.controller = function ($window) {
    var c = this;
    c.loading = false;

    // ---------------- landing / search ----------------
    if (!c.data.domainId) {
        c.filter = angular.copy(c.data.filter);
        c.hideEmpty = false;
    }
    c.groupShown = function (g) {
        return !c.filter.groupId || c.filter.groupId === g.id;
    };
    c.domainShown = function (d) {
        return !c.hideEmpty || d.elements.length > 0;
    };
    c.shownDomainCount = function () {
        var n = 0;
        angular.forEach(c.data.lib.groups, function (g) {
            if (c.groupShown(g)) angular.forEach(g.domains, function (d) { if (c.domainShown(d)) n++; });
        });
        return n;
    };
    c.setGroup = function (id) {
        c.filter.groupId = id;
    };
    c.search = function () {
        c.loading = true;
        c.server.get({ filter: c.filter }).then(function (r) {
            c.data.lib = r.data.lib;
            c.loading = false;
        });
    };
    c.clearSearch = function () {
        c.filter.text = '';
        c.filter.levelId = '';
        c.search();
    };
    c.preview = function (d) {
        var names = [];
        for (var i = 0; i < d.elements.length && i < 3; i++) names.push(d.elements[i].name);
        return names.join(' · ') + (d.elements.length > 3 ? ' · +' + (d.elements.length - 3) + ' more' : '');
    };

    // ---------------- domain (master–detail) ----------------
    if (c.data.dom) {
        var els = c.data.dom.elements, start = els[0];
        for (var i = 0; i < els.length; i++) if (els[i].id === c.data.elementId) start = els[i];
        c.current = start || null;
        c.currentId = c.current ? c.current.id : '';
        c.siblingId = c.data.dom.domain.id;
    }
    c.pick = function (e) {
        c.current = e;
        c.currentId = e.id;
    };
    c.pickById = function () {
        angular.forEach(c.data.dom.elements, function (e) { if (e.id === c.currentId) c.current = e; });
    };
    c.goDomain = function () {
        if (c.siblingId && c.siblingId !== c.data.dom.domain.id)
            $window.location.href = '?id=x_2317791_cms2_library&domain=' + c.siblingId;
    };
    c.range = function (e) {
        if (!e.levels.length) return 'No levels yet';
        var a = e.levels[0].code, b = e.levels[e.levels.length - 1].code;
        return a === b ? a : a + '–' + b;
    };
    c.isTarget = function (e, l) {
        return e.myTarget && e.myTarget.code === l.code;
    };
};
