littlediary.Models.Entry = Backbone.Model.extend({

    defaults: {},

    url: function() {
        return '/' + this.get('date') + '?format=json';
    }

});