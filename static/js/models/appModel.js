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
        var entries = _.sortBy(this.get('entries').models, 'id');

        // Remove all entries up till the required date
        entries = entries.filter(function(entry) {
            return moment(entry.get('date')).isSameOrBefore(date);
        })

        // Pick last entry
        var entry = _.last(entries);

        this.set({currentEntry: entry}, {silent: true});
        return entry.fetch();
    }

});
