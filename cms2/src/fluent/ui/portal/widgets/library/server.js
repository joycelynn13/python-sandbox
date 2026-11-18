(function () {
    var api = new x_2317791_cms2.CmsCatalogApi();
    // embedded = shown as a section of another page (CMS landing page)
    data.embedded = options.embedded === true || options.embedded === 'true';
    // Domain mode: ?domain=<sys_id>[&element=<sys_id>]
    data.domainId = data.embedded ? '' : ($sp.getParameter('domain') || '');
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
