api.controller = function ($element, $scope, $timeout) {
    var c = this;
    c.expanded = false;
    c.wide = false;
    c.visibleEssential = function () {
        var list = c.data.detail ? c.data.detail.essential : [];
        return c.expanded ? list : list.slice(0, c.data.maxItems);
    };
    c.hiddenCount = function () {
        var list = c.data.detail ? c.data.detail.essential : [];
        return Math.max(0, list.length - c.data.maxItems);
    };

    // Lay out by the width of the column the card sits in (side column vs main column),
    // not the window: the same card is used in narrow and wide portal columns.
    var WIDE_FROM = 560;
    function measure() {
        var w = $element[0].getBoundingClientRect().width;
        var wide = w >= WIDE_FROM;
        if (wide !== c.wide) $timeout(function () { c.wide = wide; });
    }
    $timeout(measure);
    if (window.ResizeObserver) {
        var ro = new ResizeObserver(measure);
        ro.observe($element[0]);
        $scope.$on('$destroy', function () { ro.disconnect(); });
    } else {
        angular.element(window).on('resize', measure);
        $scope.$on('$destroy', function () { angular.element(window).off('resize', measure); });
    }
};
