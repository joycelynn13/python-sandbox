(function () {
    var api = new x_2317791_cms2.CmsCatalogApi();
    // Domain mode: ?domain=<sys_id>[&element=<sys_id>]
    data.domainId = $sp.getParameter('domain') || '';
    if (data.domainId) {
        data.dom = api.getDomain(data.domainId);
        data.elementId = $sp.getParameter('element') || '';
        return;
    }
    // Landing / search mode
    var f = (input && input.filter) || {
        text: $sp.getParameter('q') || '',
        groupId: $sp.getParameter('group') || '',
        levelId: ''
    };
    data.filter = f;
    data.lib = api.getLibrary({ text: f.text, groupId: '', levelId: f.levelId });
})();
