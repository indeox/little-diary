littlediary.Model.Application = Backbone.Model.extend({

    defaults: {
        entries: null,
        currentEntry: null,
        maxDate: null
    },

    initialize: function() {
        var currentDate = new Date();
        var availableYears = ['1768', '1769', '1770', '1771'];
        var currentYear = availableYears[currentDate.getFullYear() % 4];

        this.set('maxDate', new Date(currentYear, currentDate.getMonth(), currentDate.getDate()));
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
