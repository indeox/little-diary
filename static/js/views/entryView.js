littlediary.Views.Entry = Backbone.View.extend({

    templateStr :   '<header>' +
                        '<h2 class="date"><%= date %></h2>' +
                        '<p class="chapter"><%= chapter %></p>' +
                        '<span class="weather"><%= weather %></span>' +
                        '<span class="wind"><%= wind %></span>' +
                    '</header>' +
                    '<p class="diary"><%= diary %></p>',

    initialize: function(options) {
        var self = this;
        if (options.model) {
            this.model = options.model;
        }
        _.bindAll(this, 'render');
        this.template = _.template(this.templateStr);
    },

    render: function() {
        this.$el.empty();

        var entry = this.model.get('currentEntry');

        console.log("entry", entry.toJSON());

        // Re-render;
        this.$el.html(this.template(entry.toJSON()));
        
        return this;
    }

});