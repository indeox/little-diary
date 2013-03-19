littlediary.Views.Map = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'render');
    },

    render: function() {
        var self = this;

        mapbox.load('aj.Sketchy2', function(o) {
            self.map = mapbox.map('map');
            self.map.center({ lat: -3, lon: 65 });
            self.map.zoom(2.5);
            self.map.addLayer(o.layer);


            $.getJSON('/api/route', function(data, success, xhr){
                self.createRouteLayer(data);
            });
        });

        return this;
    },

    createRouteLayer: function(data) {
        this.markers = mapbox.markers.layer();
        this.map.addLayer(this.markers);

        var markers = [];
        _.each(data, function(point, index) {
            var lat1 = parseFloat(point.location[0]),
                lng1 = parseFloat(point.location[1]),
                angle = 0;

            var point2 = data[index + 1];
            if (point2) {
                var lat2 = parseFloat(point2.location[0]),
                    lng2 = parseFloat(point2.location[1]),
                    dLat = lat2 - lat1,
                    dLng = lng2 - lng1;
                angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
            }

            markers.push({
                geometry: {
                    type: "Point",
                    coordinates: [
                        lng1,
                        lat1
                    ],
                    angle: angle
                }
            });
        }, this);

        this.markers.features(markers).factory(function(f) {
            var div = document.createElement('div'),
                span = document.createElement('span');
            // span is needed because mapbox clobbers the rotate transform
            div.appendChild(span);
            div.className = 'marker';
            $(span).css({rotate: f.geometry.angle + 'deg'});
            return div;
        });
    }

});