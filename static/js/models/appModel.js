littlediary.Model.Application = Backbone.Model.extend({

    defaults: {
        entries: null,
        currentEntry: null,
        maxDate: null
    },

    initialize: function() {
        var currentDate = new Date(),
            year = {
                '2015' : '1769',
                '2016' : '1770',
                '2017' : '1771',
                '2018' : '1772'
            };

        this.set('maxDate', new Date(year[currentDate.getFullYear()], currentDate.getMonth(), currentDate.getDate()));
    },

    fetchEntries: function() {
        var entries = new littlediary.Collection.Entries([], {});
        this.set({entries: entries});
        return entries.fetch().promise();
    },

    fetchEntry: function(date) {
        var entry = this.get('entries').get(date);
        this.set({currentEntry: entry}, {silent: true});
        return entry.fetch();
    }

});
