(function () {
    var api = new x_2317791_cms2.CmsCatalogApi();
    data.my = api.getMyRoleProfile(gs.getUserName());
    // full requirement list for the summary (Essential / Complementary with Target PL)
    data.detail = data.my && !data.my.missing ? api.getRoleProfile(data.my.id) : null;
})();
