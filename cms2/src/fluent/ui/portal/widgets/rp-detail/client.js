api.controller = function () {
    var c = this;
    c.open = {};
    // Built once: an inline array literal in ng-repeat creates a new array every
    // digest and aborts rendering ("10 $digest() iterations reached").
    c.sections = c.data.rp ? [
        { key: 'essential', title: 'Essential', rows: c.data.rp.essential },
        { key: 'complementary', title: 'Complementary', rows: c.data.rp.complementary }
    ] : [];
    c.toggle = function (reqId) {
        c.open[reqId] = !c.open[reqId];
    };
};
