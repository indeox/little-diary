littlediary.View.Application = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'render', 'show');

        this.views = {
            entry: new littlediary.View.Entry({el: '#entry', model: this.model}),
            map: new littlediary.View.Map({el: '#map', model: this.model})
        };

        // iOS doesn't allow media to play without user
        // action, so we default it to off
        var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
        if (iOS == true) { localStorage.setItem('ambient', 'false');}
        this.handleAmbientSound();
    },

    events: {
        'click .ambient' : 'toggleAmbientSound'
    },

    render: function() {
        this.views.map.render();
        return this;
    },

    show: function(route, date) {
        var self = this;

        if (route === 'entry') {
            if (!date) {
                var currentYear = new Date().getFullYear();
                var availableYears = ['1768', '1769', '1770', '1771'];
                currentYear = availableYears[currentYear % 4];

                date = new moment().year(currentYear).format("YYYY-MM-DD");
            }
            this.$el.addClass('loading');
            this.model.fetchEntry(date).done(function() {
                self.views.map.updateRouteLayer();
                self.views.entry.render();
                self.$el.removeClass('loading');
            });
        }
    },


    toggleAmbientSound: function(e) {
        e.preventDefault();
        this.ambientSound = (this.ambientSound == "true") ? "false" : "true"; // Strings, because that's how localStorage handles them
        localStorage.setItem('ambient', this.ambientSound);

        this.handleAmbientSound();
    },

    handleAmbientSound: function() {
        var audioNode = $('.ambient-player'),
            audioSrc = audioNode.attr('src');

        // Loop audio
        // Chrome/Firefox don't seem to loop with the
        // loop attribute only, so we do it in JS
        audioNode.bind('timeupdate', function() {
            if (this.currentTime > 60) {
                this.src = audioSrc;
                this.play();
            }
        });

        this.ambientSound = localStorage.getItem('ambient');

        if (this.ambientSound === "true") {
            this.$('.ambient').addClass('active');
            audioNode[0].volume = 0;
            audioNode[0].loop = true;
            audioNode[0].play();
            audioNode.animate({volume: 1}, 5000);
        } else {
            this.$('.ambient').removeClass('active');
            audioNode.animate({volume: 0}, 2000, 'swing', function() {
                audioNode[0].pause();
            });
        }

    }

});
