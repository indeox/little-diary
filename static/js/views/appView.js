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
        this.views.map.render();
        return this;
    },

    show: function(route, date) {
        var self = this;

        if (route === 'entry') {
            if (!date) {
                var currentDate = new moment().format("YYYY-MM-DD");
                date = currentDate.replace('2013', '1769'); // Quick hack to get it working, fix later
            }
            this.$el.addClass('loading');
            this.model.fetchEntry(date).done(function() {
                self.views.entry.render();
                self.$el.removeClass('loading');
            });
        }
    }

});