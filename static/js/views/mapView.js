littlediary.Views.Map = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'handleAmbientSound', 'toggleAmbientSound', 'render');

        this.handleAmbientSound();
    },

    events: {
        'click .ambient' : 'toggleAmbientSound'
    },

    render: function() {
        var self = this;

        mapbox.load('aj.Sketchy2', function(o) {
            self.map = mapbox.map('map');
            self.map.center({ lat: 5, lon: -40 });
            self.map.zoom(2.5);
            self.map.addLayer(o.layer);
            self.map.ui.zoomer.add();
            self.map.ui.attribution.add();

            $.getJSON('/api/route', function(data, success, xhr){
                self.createRouteLayer(data);
            });
        });

        return this;
    },

    createRouteLayer: function(data) {
        this.markers = mapbox.markers.layer();
        this.map.addLayer(this.markers);

        var markers = [],
            entry = this.model.get('currentEntry'),
            currentDate = entry.get('date');

        // Only show the route up till today's date
        for (var i = 0, length = data.length; i < length; i++) {
            var point = data[i],
                date = point.date,
                lat1 = parseFloat(point.location[0]),
                lng1 = parseFloat(point.location[1]),
                angle = null;

            var point2 = data[i + 1];
            if (point2) {
                var lat2 = parseFloat(point2.location[0]),
                    lng2 = parseFloat(point2.location[1]),
                    dLat = lat2 - lat1,
                    dLng = lng2 - lng1;

                if (dLat !== 0 || dLng !== 0) {
                    angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
                }
            }

            var feature = {
                geometry: {
                    type: "Point",
                    coordinates: [
                        lng1,
                        lat1
                    ],
                    angle: angle
                },
                id: date
            };
            markers.push(feature);
            if (date === currentDate) {
                feature.isCurrent = true;
                break;
            }
        }

        this.markers.features(markers).factory(function(f) {
            var div = document.createElement('div'),
                span = document.createElement('span');
            // span is needed because mapbox clobbers the rotate transform
            div.appendChild(span);
            div.id = f.id;
            div.className = 'marker';
            if (f.isCurrent) {
                div.className = 'marker ship';
            }
            if (f.geometry.angle) {
                $(span).css({rotate: f.geometry.angle + 'deg'});
            } else {
                $(span).addClass('no-movement');
            }
            return div;
        });
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
        // Chrome/Firefbox don't seem to loop with the
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
            audioNode.animate({volume: 1}, 2000);
        } else {
            this.$('.ambient').removeClass('active');
            audioNode.animate({volume: 0}, 2000, 'swing', function() {
                audioNode[0].pause();
            });
        }

    }

});