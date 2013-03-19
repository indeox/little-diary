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
        _.each(data, function(point) {
            var lat = parseFloat(point.location[0]),
                lng = parseFloat(point.location[1]);
                
            markers.push({
                geometry: {
                    type: "Point",
                    coordinates: [
                        lng,
                        lat
                    ]
                }
            });
        }, this);

        this.markers.features(markers).factory(function(f) {
            var span = document.createElement('span');
            span.className = 'marker';
            return span;
        });

        var nodes = this.$el.find('span.marker');
        for (var i = 0, length = nodes.length; i < length; i++) {
            var thisNode = nodes[i],
                nextNode = nodes[i + 1];

            if (nextNode) {
                var pos1 = $(thisNode).position(),
                    pos2 = $(nextNode).position();

                var deltaY = pos2.top - pos1.top,
                    deltaX = pos2.left - pos1.left;

                var angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 180;
                
                console.log(angle, deltaY, deltaX);

                var transform = $(thisNode).css('-webkit-transform');
                $(thisNode).css({'-webkit-transform': transform + 'rotate(' + angle + 'deg)'});
            }
        }
    }

});