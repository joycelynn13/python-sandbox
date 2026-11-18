api.controller = function ($location) {
    var c = this;
    c.tabs = [
        { id: 'x_2317791_cms2_home', label: 'Home', also: [] },
        { id: 'x_2317791_cms2_role_profiles', label: 'Role Profiles', also: ['x_2317791_cms2_role_profile'] },
        { id: 'x_2317791_cms2_library', label: 'Competency Library', also: ['x_2317791_cms2_element'] }
    ];
    var current = $location.search().id;
    c.isActive = function (t) {
        return t.id === current || t.also.indexOf(current) >= 0;
    };
};
