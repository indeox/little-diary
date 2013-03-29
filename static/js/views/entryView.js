littlediary.View.Entry = Backbone.View.extend({

    events : {
        'click a.previous'  : 'onNavigate',
        'click a.next'      : 'onNavigate'
    },

    templateStr :   '<header>' +
                        '<h2 class="date"><%= date %></h2>' +
                        '<p class="chapter"><%= chapter %></p>' +
                        //'<span class="weather"><%= weather %></span>' +
                        //'<span class="wind"><%= wind %></span>' +
                    '</header>' +
                    '<p class="diary">' +
                        '<%= diary %>' +
                        //'<img src="/static/img/cook_signature.png">' +
                    '</p>' +
                    '<p class="attribution">From <a href="http://www.gutenberg.org/ebooks/8106">' +
                        'Captain Cook\'s Journal During His First Voyage Round the World' +
                    '</a></p>' +
                    '<div class="navigation">' +
                        '<a href="/<%= previous %>" class="previous">&larr;Previous</a>' +
                        '<% if (next) { %> <a href="/<%= next %>" class="next">Next&rarr;</a> <% } %>' +
                    '</div>',

    initialize: function(options) {
        var self = this;
        if (options.model) {
            this.model = options.model;
        }
        _.bindAll(this, 'render');
        this.template = _.template(this.templateStr);
    },

    render: function() {
        var node = this.$el.find('.content').empty();

        var entries = this.model.get('entries'),
            entry = this.model.get('currentEntry'),
            previous = entries.at(entries.indexOf(entry) - 1),
            next = entries.at(entries.indexOf(entry) + 1),
            values = entry.toJSON();

        values.date = moment(values.id).format('MMMM Do YYYY');
        values.previous = (previous) ? previous.id : null;
        values.next = (next && next.get('date') <= this.model.get('maxDate')) ? next.id : null;

        // Re-render;
        node.html(this.template(values));

        return this;
    },

    onNavigate: function(e) {
        var target = $(e.currentTarget);
        app.router.navigate(target.attr('href'), {trigger: true});
        e.preventDefault();
    }

});