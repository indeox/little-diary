window.littlediary = {

    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function() {
        window.app = this;
        var self = this;

        app.model = new littlediary.Models.Application();
        app.view = new littlediary.Views.Application({model: app.model, el: '#app'});
        app.router = new littlediary.Routers.Application({model: app.model, view: app.view});
        Backbone.history.start({pushState: true});
    }
};

$(document).ready(function(){
    littlediary.init();
});