(function () {
    // Reusable "My Role Profile" card: CMS landing page, Xponent Hub home, or any portal page.
    var api = new x_2317791_cms2.CmsCatalogApi();
    data.maxItems = parseInt(options.max_items, 10) || 5;
    data.hideWhenEmpty = options.hide_when_empty === true || options.hide_when_empty === 'true';
    data.my = api.getMyRoleProfile(gs.getUserName());
    data.detail = data.my && !data.my.missing ? api.getRoleProfile(data.my.id) : null;
})();
