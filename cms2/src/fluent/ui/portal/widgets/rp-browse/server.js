(function () {
    var api = new x_2317791_cms2.CmsCatalogApi();
    var f = (input && input.filter) || {
        text: $sp.getParameter('q') || '',
        businessFunction: $sp.getParameter('function') || '',
        jobFamily: $sp.getParameter('family') || '',
        jobTitle: ''
    };
    data.filter = f;
    data.result = api.browseRoleProfiles({
        text: f.text,
        businessFunction: f.businessFunction,
        jobFamily: f.jobFamily,
        jobTitle: f.jobTitle
    });
})();
