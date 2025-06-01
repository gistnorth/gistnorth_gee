### 1. Image
#### Image object
```javascript
// Image object
var image = ee.Image('LANDSAT/LC09/C02/T1_L2/LC09_129050_20231220')
              .multiply(0.0000275);
var band4 = image.select('SR_B4');
var band3 = image.select('SR_B3');
var band2 = image.select('SR_B2');
var rgb = band4.addBands(band3).addBands(band2);
Map.centerObject(image, 10);
Map.addLayer(rgb, {min: 0.2, max: 0.6, gamma: 2.0}, 'RGB');

```
#### Image from ImageCollection
```javascript

// Image from ImageCollection
var bangkok = ee.Geometry.Point([100.5018, 13.7563]);
// Load Landsat 9 Collection 2 Tier 1 raw data
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(bangkok)
  .filterDate('2023-01-01', '2023-12-31')
  .sort('CLOUD_COVER')
  .first();

// Select desired spectral bands
var image = landsat9.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5']);

// Apply scale factors for Surface Reflectance
var opticalBands = image.select('SR_B.').multiply(0.0000275);

// Add image properties
var image = opticalBands
  .set({
    'system:time_start': landsat9.get('system:time_start'),
    'ACQUISITION_DATE': landsat9.date().format('YYYY-MM-dd'),
    'SPACECRAFT_ID': landsat9.get('SPACECRAFT_ID'),
    'CLOUD_COVER': landsat9.get('CLOUD_COVER')
  });

// Print image metadata
print('Landsat 9 Image Metadata:', image);
print('Acquisition Date:', image.get('ACQUISITION_DATE'));
print('Available Band Names:', image.bandNames());

// Visualization parameters
var trueColor = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.2,
  max: 0.7,
  gamma: 2.0
};

// Center map and display
Map.centerObject(bangkok, 10);
Map.addLayer(image, trueColor, 'Landsat 9 True Color');

```

### 2. Image Collection
```javascript
// Image Collection object sentinel 2 with cloud mask and median composite
var geometry = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate('2021-01-01', '2021-01-31')
    .filterBounds(geometry)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .select(['B4', 'B3', 'B2'])
    .median()
    .multiply(0.0001);
Map.centerObject(geometry, 10);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.3, gamma: 1.5}, 'Median Image');
```

### 3. Geometry
```javascript
// Geometry object
var point = ee.Geometry.Point([98.9171009716561, 18.815619476862654]);
var line = ee.Geometry.LineString([[98.9171009716561, 18.815619476862654], [99.0873890575936, 18.68557890893041]]);
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var buffer = point.buffer(1000);  // Buffer of 1000 meters
var centroid = polygon.centroid();
var area = polygon.area();  // Area of the polygon
print('Point:', point);
print('Line:', line);
print('Polygon:', polygon);
print('Buffer:', buffer);
print('Centroid:', centroid);
print('Area:', area);
// Map visualization
Map.centerObject(polygon, 10);
Map.addLayer(point, {color: 'yellow'}, 'Point');
Map.addLayer(line, {color: 'orange'}, 'Line');
Map.addLayer(polygon, {color: 'red'}, 'Polygon');
Map.addLayer(buffer, {color: 'blue'}, 'Buffer');  
Map.addLayer(centroid, {color: 'green'}, 'Centroid');  
```

### 4. Feature
```javascript
// Feature object
var point = ee.Geometry.Point([98.9171009716561, 18.815619476862654]);
var feature = ee.Feature(point, {name: 'Chiang Mai', population: 1000000});
print('Feature:', feature);

// Polygon feature
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var feature = ee.Feature(polygon, {name: 'Chiang Mai', population: 1000000});
print('Feature:', feature);
// add to map
Map.centerObject(feature, 10);
Map.addLayer(feature, {color: 'red'}, 'Feature');
```

### 5. Feature Collection
```javascript
// Feature Collection object
var point1 = ee.Geometry.Point([98.9171009716561, 18.815619476862654]);
var point2 = ee.Geometry.Point([99.0873890575936, 18.68557890893041]);
var feature1 = ee.Feature(point1, {name: 'Chiang Mai', population: 1000000});
var feature2 = ee.Feature(point2, {name: 'Sarapee', population: 8000000});
var featureCollection = ee.FeatureCollection([feature1, feature2]);
print('Feature Collection:', featureCollection);
// add to map
Map.centerObject(featureCollection, 10);
Map.addLayer(featureCollection, {color: 'red'}, 'Feature Collection');
```

### 6. Reducer
```javascript
// Per-pixel time series
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-12-31')
           .filterBounds(polygon);

// Compute per-pixel mean across time
var meanTime = s2.reduce(ee.Reducer.mean());

Map.addLayer(meanTime, {bands:['B4_mean','B3_mean','B2_mean'], min:0, max:3000}, 'Mean per Pixel over Time');
```
#### Histogram
```javascript
// Grouped by time
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-12-31')
           .filterBounds(polygon);
var months = ee.List.sequence(1, 12);

var monthlyCount = months.map(function(m) {
  var filtered = s2.filter(ee.Filter.calendarRange(m, m, 'month'));
  return filtered.size();
});

print('Images per month (2021):', monthlyCount);

// add histogram chart
var chart = ui.Chart.array.values(monthlyCount, 0, months)
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Monthly Image Count (2021)',
      hAxis: {title: 'Month'},
      vAxis: {title: 'Image Count'},
      legend: {position: 'none'}
    });
print(chart);
```
#### Image statistics (reduceRegion)
```javascript
// Regional statistics (reduceRegion)
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-03-31')
           .filterBounds(polygon);
var meanTime = s2.reduce(ee.Reducer.mean());
var stats = meanTime.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.max(),
    sharedInputs: true
  }),
  geometry: polygon,
  scale: 30
});
print('Mean & Max over polygon:', stats);
```
#### Neighborhood / Focal operations (reduceNeighborhood)
```javascript
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-12-31')
           .filterBounds(polygon);
var meanTime = s2.reduce(ee.Reducer.mean());
// Neighborhood / Focal operations (reduceNeighborhood)
var focalMean = meanTime.reduceNeighborhood({
  reducer: ee.Reducer.mean(),
  kernel: ee.Kernel.square({radius: 1})
});
Map.addLayer(focalMean, {min:0, max:3000}, '3×3 Focal Mean');

```
#### Per-band summary (reduceRegion on multiband)
```javascript
// Per-band summary (reduceRegion on multiband)
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-03-31')
           .filterBounds(polygon);
var composite = s2.median();
var bandStats = composite.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: polygon,
  scale: 100
});
print('Mean per band:', bandStats);
```
#### Across-band summary (reduceRegion on multiband)
```javascript
// Across-band reduction (reduce)
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2021-01-01','2021-12-31')
           .filterBounds(polygon)  
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
           .select(['B8', 'B4']);

var ndviCollection = s2.map(function(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return ndvi.copyProperties(img, img.propertyNames());
});

var meanNDVI = ndviCollection.reduce(ee.Reducer.mean());
Map.addLayer(meanNDVI, {min: -1.0, max: 1.0}, 'mean across Bands');
```
#### Reducer Image object
```javascript
// Reducer Image object
var reducer = ee.Reducer.mean();
var image = ee.Image('LANDSAT/LC09/C02/T1_L2/LC09_129050_20231220');
var mean = image.reduceRegion({
    reducer: reducer,
    geometry: image.geometry(),
    scale: 30,
    maxPixels: 1e13
});
print('Mean:', mean);

// Image Collection reduce by polygon
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2021-01-01', '2021-01-31')
    .filterBounds(polygon)
    .select(['B4', 'B3', 'B2'])
    .mean()
    .clip(polygon);  

// zonal statistics
var mean = collection.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: polygon,
    scale: 30,
    maxPixels: 1e13
});

print(mean);
Map.centerObject(polygon, 13);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Mean Image');

// Feature Collection reducer
var feature1 = ee.Feature(point1, {name: 'Chiang Mai', population: 1000000});
var feature2 = ee.Feature(point2, {name: 'Sarapee', population: 8000000});
var featureCollection = ee.FeatureCollection([feature1, feature2]);
var meanPopulation = featureCollection.reduceColumns({
    reducer: ee.Reducer.mean(),
    selectors: ['population']
});
print('Mean Population:', meanPopulation.get('mean'));  // prints: Mean Population: 4000000
```

### 7 join
```javascript
// Define point and polygon collections
var points = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([100.5,13.7]), {pid:1}),
  ee.Feature(ee.Geometry.Point([100.55,13.75]), {pid:2})
]);
var polygons = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Rectangle([100.4,13.6,100.6,13.8]), {zone: 'A'}),
  ee.Feature(ee.Geometry.Rectangle([100.45,13.65,100.65,13.85]), {zone: 'B'})
]);

// Create a spatial filter: point within polygon
var spatialFilter = ee.Filter.contains({
  leftField: '.geo',    // polygon geometry
  rightField: '.geo'    // point geometry
});

// Perform an inner spatial join
var spatialJoin = ee.Join.inner();
var spatialJoined = spatialJoin.apply(polygons, points, spatialFilter);

// Attach point property 'pid' to each polygon
var result = spatialJoined.map(function(f) {
  var poly = ee.Feature(f.get('primary'));
  var pt   = ee.Feature(f.get('secondary'));
  return poly.set('point_id', pt.get('pid'));
});

// Display on the map
Map.centerObject(polygons, 10);

// Polygons in blue
Map.addLayer(polygons, {color: 'blue'}, 'Polygons');

// Points in black
Map.addLayer(points, {color: 'black'}, 'Points');

// Spatially-joined polygons with attached pid in purple
Map.addLayer(result, {color: 'purple'}, 'Spatial Join');

```
