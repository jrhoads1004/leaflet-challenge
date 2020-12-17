function createMap(earthquakes, lines) {
    
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15,
    id: "mapbox.light",
    accessToken: API_KEY
    });
    
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15,
    id: "mapbox.dark",
    accessToken: API_KEY
    });
    
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15,
    id: "mapbox.outdoors",
    accessToken: API_KEY
    });  
       

    var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Outdoor Map": outdoors
    };    
    
    var overlayMaps = {
    "Earth Quakes": earthquakes,
    "Fault Lines": lines
    }; 
    
    var map = L.map("map", {
    center: [35.09, -100.71],
    zoom: 4,
    layers: [lightmap, earthquakes]
    });    
    
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(map);
    
    var legend = L.control({position: 'bottomright'});
    
    function color(magnitude) {
    return magnitude < 1 ? '#DA70D6' :
           magnitude < 2.5 ? '#BA55D3' :
           magnitude < 4.5 ? '#8A2BE2' :
           magnitude < 6 ? '#8B008B' :
                           '#4B0082' ;
    };
    
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [Infinity, 6, 4.5, 2.5, 1],
            labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + color(grades[i] - .1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '>');
        }

        return div;
    };
    
    legend.addTo(map);
}

function createCircles(data) {
    
    console.log(data);
    
    function markerSize(magnitude) {
        return magnitude * 5;
    } 
    
    function color(magnitude) {
    return magnitude < 1 ? '#DA70D6' :
           magnitude < 2.5 ? '#BA55D3' :
           magnitude < 4.5 ? '#8A2BE2' :
           magnitude < 6 ? '#8B008B' :
                           '#4B0082' ;
    };

    earthquakes = []
    
    for (var i=0; i < data.features.length; i++) {
        var quake = L.circleMarker([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]], {
            fillOpacity: .75,
            color: "white",
            weight: .5,
            fillColor: color(data.features[i].properties.mag),
            radius: markerSize(data.features[i].properties.mag) 
        }).bindPopup("<h3>" + data.features[i].properties.title + "<br><p class='link'><a href='" + data.features[i].properties.url + "' target='_blank'>" + data.features[i].properties.url + "</a></p></h3>");
        earthquakes.push(quake);
    }
    
    d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json', function (data) {
        function coords(line) {
            var newLine = []
            for (j=0; j<line.length; j++) {
                var newpoints = [];
                var secpoint = line[j][1];
                var firpoint = line[j][0];
                var list = [secpoint, firpoint];
                newLine.push(list);
            };
            return newLine;
        };

        var lines = []

        for (i=0; i < data.features.length; i++) {
            var line = data.features[i].geometry.coordinates;
            var plotline = L.polyline(coords(line), {
                color: "yellow",
                fillColor: "yellow",
                fillOpacity: 0.75
            });
            lines.push(plotline);
        }
        createMap(L.layerGroup(earthquakes), L.layerGroup(lines));
    });
};

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson', createCircles);