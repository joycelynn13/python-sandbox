(function () {
    var api = new x_2317791_cms2.CmsCatalogApi();
    var f = (input && input.filter) || {
        text: $sp.getParameter('q') || '',
        groupId: $sp.getParameter('group') || '',
        levelId: ''
    };
    data.filter = f;
    data.lib = api.getLibrary({ text: f.text, groupId: f.groupId, levelId: f.levelId });
})();
