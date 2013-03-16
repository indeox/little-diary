littlediary.Views.Application = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'render', 'show');

        this.views = {
            entry: new littlediary.Views.Entry({el: '#entry', model: this.model}),
            map: new littlediary.Views.Map({el: '#map', model: this.model})
        };

        this.render();
    },

    render: function() {
        return this;
    },

    show: function(route, date) {
        var self = this;

        if (route === 'entry') {
            date = date || new moment().format("YYYY-MM-DD");
            this.$el.addClass('loading');
            this.model.fetchEntry(date).done(function() {
                self.views.entry.render();
                self.$el.removeClass('loading');
            });
        }
    }

});