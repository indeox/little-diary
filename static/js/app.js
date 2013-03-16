window.littlediary = {

    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function() {
        window.app = this;
        var self = this;

        app.model = new littlediary.Models.Application();

        // Show loading indicator
        $('#app').addClass('loading');

        // Load map
        mapbox.load('aj.Sketchy2', function(o) {
            var map = mapbox.map('map');
            map.center({ lat: -3, lon: 65 });
            map.zoom(2.5);
            map.addLayer(o.layer);

            app.view = new littlediary.Views.Application({model: app.model, el: '#app'});
            app.router = new littlediary.Routers.Application({model: app.model, view: app.view});
            Backbone.history.start({pushState: true});
            $('#app').removeClass('loading');
        });
    }
};

$(document).ready(function(){
    littlediary.init();
});