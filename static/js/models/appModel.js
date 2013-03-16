littlediary.Models.Application = Backbone.Model.extend({

    defaults: {
        currentEntry: null
    },

    fetchEntry: function(date) {
        console.log('ddate', date);
        var entry = new littlediary.Models.Entry({date: date});
        this.set({currentEntry: entry}, {silent: true});
        return entry.fetch();
    }

});