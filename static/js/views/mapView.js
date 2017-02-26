littlediary.View.Map = Backbone.View.extend({

    initialize: function() {
        var self = this;
        _.bindAll(this, 'render');

        this.tileJson = {
            "attribution": "",
            "bounds": [
                -180,
                -85.0511,
                180,
                85.0511
            ],
            "center": [
                0,
                0,
                2
            ],
            "created": 1362415763000,
            "description": "",
            "download": "https://a.tiles.mapbox.com/v3/aj.Sketchy2.mbtiles",
            "embed": "https://a.tiles.mapbox.com/v3/aj.Sketchy2.html",
            "filesize": 232957952,
            "id": "aj.Sketchy2",
            "mapbox_logo": true,
            "maxzoom": 6,
            "minzoom": 0,
            "name": "Pirate Map",
            "private": false,
            "scheme": "xyz",
            "template": "",
            "tilejson": "2.2.0",
            "tiles": [
                "https://a.tiles.mapbox.com/v3/aj.Sketchy2/{z}/{x}/{y}.png",
                "https://b.tiles.mapbox.com/v3/aj.Sketchy2/{z}/{x}/{y}.png"
            ],
            "version": "1.0.0",
            "webpage": "https://a.tiles.mapbox.com/v3/aj.Sketchy2/page.html"
        };
    },

    render: function() {
        var self = this;

        mapbox.MAPBOX_URL = mapbox.MAPBOX_URL.replace('http:', 'https:');

        this.map = mapbox.map('map');
        this.map.lay
        this.map.center({ lat: -50, lon: 0 });
        this.map.zoom(2.5);
        this.map.addLayer(mapbox.layer().tilejson(this.tileJson));
        this.map.ui.zoomer.add();
        this.map.ui.attribution.add().content('Tiles by <a href="http://mapbox.com/about/maps">MapBox</a>');

        return this;
    },

    updateRouteLayer: function() {
        if (this.markers) {
            this.map.removeLayer(this.markers);
        }

        this.markers = mapbox.markers.layer();
        this.map.addLayer(this.markers);

        var markers = [],
            data = this.model.get('entries').toJSON(),
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

        this.markers.key(function(f) {
            return f.id;
        });

        var shipMarker = _.last(markers);
        this.map.ease.location({lat: shipMarker.geometry.coordinates[1], lon: shipMarker.geometry.coordinates[0]}).zoom(2.5).optimal();
    }

});
