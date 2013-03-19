littlediary.Models.Entry = Backbone.Model.extend({

    defaults: {},

    url: function() {
        return '/api/entry/' + this.get('date');
    }

});