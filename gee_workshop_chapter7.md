
### 7. UI Elements
#### 7.1 Create UI Panel
```javascript
// Create the left “layer” panel
var layerPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '300px',
    backgroundColor: '#fff',
    padding: '8px'
  }
});
layerPanel.add(ui.Label('Layers', {fontWeight: 'bold'}));

// Create the centre map panel
var mapPanel = ui.Map();
mapPanel.setControlVisibility({all: true, zoomControl: true});
mapPanel.style().set({stretch: 'both'});  // fill available space
mapPanel.setCenter(100.5, 13.7, 8);

// Create the right “chart” panel
var chartPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '300px',
    backgroundColor: '#fff',
    padding: '8px'
  }
});
chartPanel.add(ui.Label('Chart', {fontWeight: 'bold'}));

// Combine all three in a horizontal root panel
var root = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {stretch: 'both'}
});
root.add(layerPanel);
root.add(mapPanel);
root.add(chartPanel);

// Render
ui.root.clear();
ui.root.add(root);
```
#### 7.2 Add layers
```javascript
// Add layers
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
// convert polygon to polyline
var polyline = polygon.bounds().coordinates().get(0);

// Clip function
function clipImage(image) {
  return image.clip(polygon);
}

// Calculate NDVI function
function calculateNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
}

// Create a polyline feature
var polylineFeature = ee.Feature(ee.Geometry.LineString(polyline), {name: 'Polygon Boundary'});
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon)
           .map(clipImage)
           .map(calculateNDVI);
           
var composite = s2.median();

// Select bands for NDVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band

// Calculate NDVI
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Add NDVI to the composite
var compositeWithNDVI = composite.addBands(ndvi);

// Define visualization parameters for NDVI
var ndviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};

// Define visualization parameters for the composite
var compositeVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 1000,
  max: 2700,
  gamma: 0.5
};

// Create an NDVI layer
var ndviLayer = ui.Map.Layer(
  compositeWithNDVI.select('NDVI'), 
  ndviVis, 
  'NDVI',
  true, 
  0.9
);

// Add the NDVI layer to the map
mapPanel.add(ndviLayer);

// Add the polyline feature to the map
var polylineLayer = ui.Map.Layer(
  polylineFeature.geometry(), 
  {color: 'red', width: 2}, 
  'Polygon Boundary'
);

// Add the polyline layer to the map
mapPanel.add(polylineLayer);

// Create a true color layer
var trueColorLayer = ui.Map.Layer(
  composite, compositeVis, 
  'True Color Composite', 
  true, 
  0.9
);

// Add the true color layer to the map
mapPanel.add(trueColorLayer);

// Set center the map on the polygon
mapPanel.centerObject(polygon); 
```
#### 7.3 Add checkboxes
```javascript
// Add checkboxes to the layer panel
// Checkbox for NDVI
var ndviCheckbox = ui.Checkbox({
  label: 'NDVI',
  value: true,
  onChange: function(checked) {
    if (checked) {
      mapPanel.layers().add(ndviLayer);
    } else {
      mapPanel.layers().remove(ndviLayer);
    }
  }
});

// Add the checkbox to the layer panel
layerPanel.add(ndviCheckbox);

// Checkbox for True Color
var trueColorCheckbox = ui.Checkbox({
  label: 'True Color',
  value: true,
  onChange: function(checked) {
    if (checked) {
      mapPanel.layers().add(trueColorLayer);
    } else {
      mapPanel.layers().remove(trueColorLayer);
    }
  }
});

// Add the checkbox to the layer panel
layerPanel.add(trueColorCheckbox);

// Checkbox for Polygon Boundary
var polylineCheckbox = ui.Checkbox({
  label: 'Polygon Boundary',
  value: true,
  onChange: function(checked) {
    if (checked) {
      mapPanel.layers().add(polylineLayer);
    } else {
      mapPanel.layers().remove(polylineLayer);
    }
  }
});

// Add the checkbox to the layer panel
layerPanel.add(polylineCheckbox);
```
#### 7.4 Add chart buttons
```javascript
// Add a button to the chart panel
var chartButton = ui.Button({
  label: 'Show NDVI Chart',
  onClick: function() {
    // Create a chart for NDVI
    var chart = ui.Chart.image.histogram({
      image: compositeWithNDVI.select('NDVI'),
      region: polygon,
      scale: 30,
      minBucketWidth: 0.01
    }).setOptions({
      title: 'NDVI Histogram',
      hAxis: {title: 'NDVI'},
      vAxis: {title: 'Frequency'},
      lineWidth: 1,
      pointSize: 0
    });
    // Add the chart to the chart panel
    chartPanel.add(chart);
  }
});

// Add the button to the chart panel
chartPanel.add(chartButton);

var timeSeriesButton = ui.Button({
  label: 'Show NDVI Time Series',
  onClick: function() {
    // Create a time series chart for NDVI
    var timeSeriesChart = ui.Chart.image.series({
      imageCollection: s2.select('NDVI'),
      region: polygon,
      scale: 30,
      xProperty: 'system:time_start'
    }).setOptions({
      title: 'NDVI Time Series',
      vAxis: {title: 'NDVI'},
      lineWidth: 1,
      pointSize: 0
    });
    // Add the chart to the chart panel
    chartPanel.add(timeSeriesChart);
  }
});

// Add the time series button to the chart panel
chartPanel.add(timeSeriesButton);

```