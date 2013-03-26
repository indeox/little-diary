littlediary.Views.Application = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'render', 'show');

        this.views = {
            entry: new littlediary.Views.Entry({el: '#entry', model: this.model}),
            map: new littlediary.Views.Map({el: '#map', model: this.model})
        };


        // iOS doesn't allow media to play without user
        // action, so we default it to off
        var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
        if (iOS == true) { this.ambientSound = "false"; }
        this.handleAmbientSound();

        this.render();
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
                var currentDate = new moment().format("YYYY-MM-DD");
                date = currentDate.replace('2013', '1769'); // Quick hack to get it working, fix later
            }
            this.$el.addClass('loading');
            this.model.fetchEntry(date).done(function() {
                self.views.entry.render();
                self.$el.removeClass('loading');
            });
        }
    },


    toggleAmbientSound: function() {
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