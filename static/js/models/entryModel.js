littlediary.Model.Entry = Backbone.Model.extend({

    defaults: {},

    url: function() {
        return '/api/entry/' + this.id;
    },

    parse: function(response) {
        var date = response.date.split('-');
        response.date = new Date(date[0], parseInt(date[1], 10) - 1, date[2]);
        return response;
    }

});