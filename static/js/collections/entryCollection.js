littlediary.Collection.Entries = Backbone.Collection.extend({

    url: '/api/route',
    model: littlediary.Model.Entry,

    parse: function(response) {
        _.each(response, function(item) {
            item.id = item.date;
        });
        return response;
    }

});