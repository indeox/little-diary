littlediary.Router.Application = Backbone.Router.extend({

    routes: {
        '':         'home',
        'about':    'about',
        ':date':    'entry'
    },

    initialize: function(options) {
        if (options.model) { this.model = options.model; }
        if (options.view) { this.view = options.view; }
        this.bind('all', this._trackPageview);
    },

    home: function() {
        this.view.show("entry");
    },

    entry: function(date) {
        this.view.show("entry", date);
    },

    about: function() {
        this.view.show("about");
    },

    _trackPageview: function() {
        var url;
        url = Backbone.history.getFragment();
        return _gaq.push(['_trackPageview', "/" + url]);
    }
});