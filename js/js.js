require([
  "react",
  "react-dom",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/widgets/LayerList",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Zoom/ZoomViewModel"
], function (
  React,
  ReactDOM,
  Map,
  MapView,
  FeatureLayer,
  QueryTask,
  Query,
  LayerList,
  GraphicsLayer,
) {
  const url =
    "https://services6.arcgis.com/30currU8oaQeVHvW/ArcGIS/rest/services/paths/FeatureServer/0";
  const fl = new FeatureLayer(url);
  const map = new Map({
    basemap: "dark-gray",
    layers: [fl]
  });
  const view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-17.93, 28.66],
    zoom: 10,
    ui: {
      components: ["attribution"]
    }
  });
  view.when(function () {
    const layerList = new LayerList({
      view: view
    });
    view.ui.add(layerList, "top-left");
  });
  const list = [
    {
      ID: ""
    }
  ];
  const layer = new GraphicsLayer({
    listMode: "hide"
  });
  map.add(layer);
  function isSearched(searchTerm) {
    return function (item) {
      return item.ID.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
    };
  }
  class Zoom extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        list,
        searchTerm: ""
      };
      this.filterPath = this.filterPath.bind(this);
      this.onSearchChange = this.onSearchChange.bind(this);
    }
    zoomToGeometry = async id => {
      layer.graphics.removeAll();
      const citiesLayerUrl =
        "https://services.arcgis.com/hkQNLKNeDVYBjvFE/ArcGIS/rest/services/senderos/FeatureServer/2";
      const queryTask = new QueryTask({
        url: citiesLayerUrl
      });
      const query = new Query();
      query.returnGeometry = true;
      query.outFields = ["ID", "DIFICULTAD", "TIPO", "LONGITUD"];
      query.where = "ID = '" + id + "'";
      await queryTask.execute(query).then(function (results) {
        const arrayResultado0 = results.features[0];
        const simbología = {
          type: "simple-line",
          color: [48, 150, 160, 1],
          width: "5px",
          style: "simple-line"
        };
        arrayResultado0.symbol = simbología;
        layer.graphics.add(arrayResultado0);
        view
          .goTo(results.features, { animate: false })
          .then(function (response) {
            var zoomView = {};
            zoomView = view.extent.expand(2.0);
            view.goTo(zoomView);
          });
      });
    };
    filterPath = async () => {
      layer.graphics.removeAll();
      const citiesLayerUrl =
        "https://services.arcgis.com/hkQNLKNeDVYBjvFE/ArcGIS/rest/services/senderos/FeatureServer/2"; // Represents the REST endpoint for a layer of cities.
      const queryTask = new QueryTask({
        url: citiesLayerUrl
      });
      const selector = document.getElementById("selectD");
      const value = selector[selector.selectedIndex].value;
      const query = new Query();
      query.returnGeometry = false;
      query.outFields = ["ID", "DIFICULTAD", "TIPO", "LONGITUD"];
      query.where = "DIFICULTAD = '" + value + "'";
      const items = [];
      await queryTask.execute(query).then(function (results) {
        const stats2 = results.features;
        for (const [index, value] of stats2.entries()) {
          const elements = stats2[index].attributes;
          items.push(elements);
        }
      });
      const isValue = item => item.DIFICULTAD == value;
      const udaptedList = this.state.list.filter(isValue);
      this.setState({ list: udaptedList });
      this.setState({ list: items });
      document.getElementById("scrool").style.visibility = "visible";
      document.getElementById("buscador").style.visibility = "visible";
      fl.definitionExpression = "DIFICULTAD = '" + value + "'";
      view.zoom = 10;
      view.center = [-17.93, 28.66];
    };
    
    onSearchChange(event) {
      this.setState({ searchTerm: event.target.value });
    }
    render() {
      return (
        <div id="mainContainer">
          <div id="rectangle">
            <div id="consult">
              <p>Dificultad : </p>
              <select class="box" id="selectD">
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Extrema">Extrema</option>
              </select>
            </div>
            <button
              onClick={() => this.filterPath()}
              type="button"
              class="myButton"
            >
              Consultar
            </button>
          </div>
          <input
            id="buscador"
            type="text"
            placeholder="Buscar..."
            onChange={this.onSearchChange}
          />
          <div id="scrool">
            {this.state.list
              .filter(isSearched(this.state.searchTerm))
              .map(item => (
                <div id="display">
                  <div id="headBox">
                    <span>{item.ID}</span>
                    <button
                      onClick={() => this.zoomToGeometry(item.ID)}
                      type="button"
                      class="zoom"
                    ></button>
                  </div>
                  <div id="result">
                    <span>Dificultad: {item.DIFICULTAD}</span>
                    <span>Tipo: {item.TIPO}</span>
                    <span>Longitud: {item.LONGITUD} km</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }
  }
  const node = document.createElement("div");
  view.ui.add(node, "top-right");
  ReactDOM.render(<Zoom view={view} />, node);
});
