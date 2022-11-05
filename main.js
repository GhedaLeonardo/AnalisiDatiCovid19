import './style.css'
var map = L.map('map').setView([41.87194, 12.56738], 6);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

fetch("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson").then(r=>r.json()).then(geoData=>{
    fetch("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni-latest.json").then(r=>r.json().then(data=>{

        function getDatiCovid(regione){
            return data.filter(d=>d.codice_regione==regione)[0];
        }

        function highlightFeature(e) {
            var layer = e.target;
            info.update(getDatiCovid(layer.feature.properties.reg_istat_code_num));
            layer.setStyle({
                weight: 3,
                color: '#1f78b4',
                dashArray: '',
                fillOpacity: 0.7
            });
        
            layer.bringToFront();
        }

        function resetHighlight(e) {
            info.update();
            geojson.resetStyle(e.target);
        }



        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }

        function getColor(d) {
            return d > 5000 ? '#800026' :
                   d > 2000  ? '#BD0026' :
                   d > 1000  ? '#E31A1C' :
                   d > 500  ? '#FC4E2A' :
                   d > 250   ? '#FD8D3C' :
                   d > 100   ? '#FEB24C' :
                   d > 50   ? '#FED976' :
                              '#FFEDA0';
        }

        function style(feature) {
            if(feature.properties.reg_istat_code_num==4){
                feature.properties.reg_istat_code_num=21;
            }
            const dati = getDatiCovid(feature.properties.reg_istat_code_num)
            return {
                fillColor: getColor(dati.nuovi_positivi),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        var geojson = L.geoJSON(geoData, {style:style, onEachFeature: onEachFeature}).addTo(map);
        var legend = L.control({position: 'bottomright'});
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
        
        info.update = function (props) {
            this._div.innerHTML = '<h4>Dati covid19</h4>' +  (props ?
                '<b>' + props.denominazione_regione + '</b><br />' + 'Nuovi positivi: ' + props.nuovi_positivi+ "<br />"
                + 'Totale positivi: ' + props.totale_positivi+ "<br />"
                + 'Totale deceduti: ' + props.deceduti+ "<br />"
                + 'Totale dimessi guariti: ' + props.dimessi_guariti+ "<br />"
                + 'Totale casi: ' + props.totale_casi+ "<br />"
                + 'Tamponi: ' + props.tamponi+ "<br />"
                + 'Ricoverati con sintomi: ' + props.ricoverati_con_sintomi+ "<br />"
                + 'Terapia intensiva: ' + props.terapia_intensiva+ "<br />"
                + 'Isolamento domiciliare: ' + props.isolamento_domiciliare+ "<br />"
                + 'Ingressi terapia intensiva: ' + props.ingressi_terapia_intensiva+ "<br />"
                : 'Muovi il cursore sopra una regione');
        };
        
        info.addTo(map);


        legend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 50, 100, 250, 500, 1000, 2000, 5000],
                labels = [];
            div.innerHTML+='<h4>Nuovi positivi</h4>';
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };
        
        legend.addTo(map);
        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }
    }))

})

