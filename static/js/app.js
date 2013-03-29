window.littlediary = {

    Model: {},
    Collection: {},
    View: {},
    Router: {},
    init: function() {
        window.app = this;
        var self = this;

        app.model = new littlediary.Model.Application();
        app.view = new littlediary.View.Application({model: app.model, el: '#app'});
        app.router = new littlediary.Router.Application({model: app.model, view: app.view});

        app.model.fetchEntries().done(function() {
            app.view.render();
            Backbone.history.start({pushState: true});
        });
    }
};

$(document).ready(function(){
    littlediary.init();
});