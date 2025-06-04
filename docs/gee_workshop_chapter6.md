
### 1. images properties
```javascript

// 1. images properties
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')
    .filterBounds(polygon)
    .select(['B4', 'B3', 'B2']) 

// 2. get properties of the image collection
// get image count
var imageCount = collection.size();
print('Image Count:', imageCount); 
// get image list
var imageList = collection.toList(imageCount);
print('Image List:', imageList);  
// get first image
var firstImage = ee.Image(imageList.get(0));
print('First Image:', firstImage); 
// get image properties
var imageProperties = firstImage.propertyNames();
print('Image Properties:', imageProperties); 
// get image bands
var imageBands = firstImage.bandNames();
print('Image Bands:', imageBands);  
// get image metadata
var imageMetadata = firstImage.getInfo();
print('Image Metadata:', imageMetadata);  
// get image date
var imageDate = firstImage.date();
print('Image Date:', imageDate); 
// get image geometry
var imageGeometry = firstImage.geometry();
print('Image Geometry:', imageGeometry); 
// get image scale
var imageScale = firstImage.select('B4').projection().nominalScale();
print('Image Scale:', imageScale);  
// get image projection
var imageProjection = firstImage.select('B4').projection();
print('Image Projection:', imageProjection); 

Map.centerObject(polygon, 10);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Image Collection');
```

#### 2 Map object
```javascript
// 3. Map object
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')
    .filterBounds(polygon)
Map.centerObject(collection, 8); 
Map.addLayer(
  collection,             // eeObject
  {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, // visParams
  'Image Collection',      // name
  true,                   // shown (hidden by default)
  0.8                      // opacity (80% transparent)
);

```

#### 3 Viuslization
```javascript
// 4. study area
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
      
// 5. vector visualization
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
    .filter(ee.Filter.eq('country_na', 'Thailand'));

var countryStyle = {
  color: 'FF0000',            // Red outline
  fillColor: 'FF000022',      // Translucent red fill
  width: 1                    // 1-pixel wide border
};

Map.addLayer(
  countries,                // eeObject
  countryStyle,             // visParams
  'Country Borders',        // name
  false,                    // shown (hidden by default)
  1.0                       // opacity (fully opaque)
);

// 6. ImageCollection visualization
var countryStyle = {
  color: 'FF0000',            // Red outline
  fillColor: 'FF000022',      // Translucent red fill
  width: 1                    // 1-pixel wide border
};
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')
    .filterBounds(polygon);
    
var rgbVis = {
  bands: ['B4', 'B3', 'B2'],  // Use red, green, blue bands
  min: 0,                     // Map pixel values from 0
  max: 3000,                  // to 3000
  gamma: 1.1                  // Apply slight gamma correction
};

Map.centerObject(collection, 8);
Map.addLayer(
  collection,               // eeObject
  rgbVis,                   // visParams
  'Sentinel-2 RGB',         // name
  true,                     // shown
  0.8                       // opacity
);

// 7. Image visualization
var dem = ee.Image('USGS/SRTMGL1_003');
var demVis = {
  min: 0,                      // lowest elevation (meters)
  max: 3000,                   // highest elevation (meters)
  palette: [
    '0000ff',                  // deep water (if below 0)
    '00ffff',                  // sea level
    '00ff00',                  // lowlands
    'ffff00',                  // mid elevations
    'ff7f00',                  // high elevations
    'ffffff'                   // peaks
  ]
};

Map.addLayer(
  dem,                     // eeObject
  demVis,                  // visParams
  'SRTM DEM',              // name
  false,                   // shown (hidden by default)
  0.5                      // opacity (50% transparent)
);

```

### 4 Filter  
```javascript
// 8. Filter
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')   // Filter method by date
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Image Collection');

// Filter by bounds
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')   // Filter method by date
    .filterBounds(polygon)                    // Filter method by bounds
Map.centerObject(polygon, 10);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Image Collection');

// Filter by cloudy pixel percentage
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2025-01-01', '2025-03-31')   // Filter method by date
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))  // Filter method by property
    .filterBounds(polygon)                    // Filter method by bounds
Map.centerObject(polygon, 10);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Image Collection');

// Filter country
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
    .filter(ee.Filter.eq('country_na', 'Thailand'));  // Filter method by property
Map.centerObject(countries, 10);
Map.addLayer(countries, {color: 'red'}, 'Country');
```

### 5 Band and band selection
#### Create a median composite and select bands
```javascript
// 9. Create a median composite and select bands
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

// Load the Sentinel-2 ImageCollection and filter by date & ROI
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);

// Create a median composite from the collection
var composite = s2.median();

// Print band names and image property keys to the Console
print('Band names:', composite.bandNames());
print('Image property names:', composite.propertyNames());

// Define visualization parameters
//    True Color: Red = B4, Green = B3, Blue = B2
var trueColorVis = {
  bands: ['B4', 'B3', 'B2'],
  min:   0,
  max:   3000,
  gamma: 0.5
};

// False Color (NIR + Red + Green): NIR = B8, Red = B4, Green = B3
var falseColorVis = {
  bands: ['B8', 'B4', 'B3'],
  min:   0,
  max:   3000,
  gamma: 0.5
};

// Center the Map on the composite and add the layers
Map.centerObject(polygon);  
Map.addLayer(composite, trueColorVis,  'True Color Composite');
Map.addLayer(composite, falseColorVis, 'False Color Composite', false, 0.8);

```
#### Band selection and add to new object
```javascript

// 10. Band selection and add to new object
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);

// Load the Sentinel-2 ImageCollection and filter by date & ROI
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);

// Create a median composite from the collection
var composite = s2.median();

// Select single bands
var band4 = composite.select('B4');
var band3 = composite.select('B3');
var band2 = composite.select('B2');

// rename bands
band4 = band4.rename('Red');
band3 = band3.rename('Green');
band2 = band2.rename('Blue');
var rgbSingleBand = band4.addBands(band3).addBands(band2);

// Select multiple bands name
var rgbMultiBand = composite.select(['B4', 'B3', 'B2']);

Map.centerObject(polygon, 10);
Map.addLayer(rgbSingleBand, {min: 0, max: 3000}, 'RGB select from single band');
Map.addLayer(rgbMultiBand, {min: 0, max: 3000}, 'RGB select from multiple band');
```

### 6 Band math

#### Calculate NDVI using band math
```javascript
// 11. Calculate NDVI using band math
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]); 

var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);

// Create a median composite from the collection
var composite = s2.median();
// Select bands for NDVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band

Map.centerObject(polygon, 10);
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'RGB Composite');

// Calculate NDVI
var ndvi = nirBand.subtract(redBand).divide(nirBand.add(redBand)).rename('NDVI');

// Add NDVI to the composite
var compositeWithNDVI = composite.addBands(ndvi);

// Print NDVI image
print('NDVI Image:', compositeWithNDVI);

// Define visualization parameters for NDVI
var ndviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};

// Add NDVI layer to the map
Map.addLayer(compositeWithNDVI.select('NDVI'), ndviVis, 'NDVI');
```
#### Calculate NDVI using normalizedDifference() method
```javascript
// 12. Calculate NDVI using normalizedDifference() method
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);
// Create a median composite from the collection
var composite = s2.median();
// Select bands for NDVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band
// normalizedDifference() method
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
// Add NDVI to the composite
var compositeWithNDVI = composite.addBands(ndvi);
// Print NDVI image
print('NDVI Image:', compositeWithNDVI);
// Define visualization parameters for NDVI
var ndviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};
// Add NDVI layer to the map
Map.addLayer(compositeWithNDVI.select('NDVI'), ndviVis, 'NDVI');    
```
#### Calculate EVI using image.expression() and band math
```javascript
// 13. Calculate EVI using image.expression() and band math
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);
// Create a median composite from the collection
var composite = s2.median();

// Select bands for EVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band
var blueBand = composite.select('B2');  // Blue band

// Calculate EVI with image.expression
var evi_exp = composite.expression(
  '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
    'NIR': nirBand,
    'RED': redBand,
    'BLUE': blueBand
}).rename('EVIexp');

// Calculate EVI with band math
var evi_funct = nirBand.subtract(redBand).divide(nirBand.add(redBand.multiply(6)).subtract(blueBand.multiply(7.5)).add(1)).multiply(2.5).rename('EVIfunct');

// Add EVI to the composite
var compositeWithEVIexp = composite.addBands(evi_exp);
var compositeWithEVIfunct = composite.addBands(evi_funct);

// Print EVI image
print('EVI Image:', compositeWithEVIexp);
print('EVI Image:', compositeWithEVIfunct);
// Define visualization parameters for EVI
var eviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};
// Add EVI layer to the map 
Map.addLayer(compositeWithEVIexp.select('EVIexp'), eviVis, 'EVI');
Map.addLayer(compositeWithEVIfunct.select('EVIfunct'), eviVis, 'EVI');
```

### 7 Clipping
#### Clipping an image with a polygon
```javascript
// 14. Clipping an image with a polygon
var polygon = ee.Geometry.Polygon(
    [[[98.39692831218161, 18.837049183879376],
          [98.39692831218161, 18.66149307399751],
          [99.62739706218161, 18.66149307399751],
          [99.62739706218161, 18.837049183879376]]]);

var dem = ee.Image('USGS/SRTMGL1_003');

// Clip the DEM with polygon
var clippedDem = dem.clip(polygon);
Map.centerObject(polygon, 10);
Map.addLayer(clippedDem, {palette: ['#a6611a','#dfc27d','#f5f5f5','#80cdc1','#018571'], min: 250, max: 1000}, 'Clipped DEM');
```
#### Clipping an image collection with a polygon
```javascript 
// 15. Clipping an image collection with a polygon
var polygon = ee.Geometry.Polygon(
    [[[98.39692831218161, 18.837049183879376],
          [98.39692831218161, 18.66149307399751],
          [99.62739706218161, 18.66149307399751],
          [99.62739706218161, 18.837049183879376]]]);

function clipImage(image) {
  return image.clip(polygon);
}
var clippedComposite = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon)
           .map(clipImage)
           .median()
Map.centerObject(polygon, 10);
Map.addLayer(clippedComposite, {bands: ['B4', 'B3', 'B2'], min: 500, max: 3000}, 'Clipped Composite');

```

### 8 Import data from assets
```javascript
// 16. Import data from assets
var cm_province = ee.FeatureCollection("projects/ee-sakda-451407/assets/cm_province_4326");

// define visualization parameters
var visParams = {
  color: 'red',
  width: 1
};

Map.centerObject(cm_province);
Map.addLayer(cm_province, visParams, 'Chiang Mai Province');
```

### 9 Export data
#### 9.1 Export an image to Google Drive
```javascript
// 17. Export an image to Google Drive
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);
var composite = s2.median();
// Select bands for NDVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band
// Calculate NDVI 
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
// Add NDVI to the composite
var compositeWithNDVI = composite.addBands(ndvi);
// Export the NDVI image to Google Drive
Export.image.toDrive({
  image: compositeWithNDVI.select('NDVI'),
  description: 'NDVI_Export',
  scale: 30,
  region: polygon,
  maxPixels: 1e13
});
```
#### 9.2 Export a feature collection to Google Drive
```javascript
// 18. Export a feature collection to Google Drive
var countries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var thailandBorder = countries.filter(ee.Filter.eq('country_na', 'Thailand'));
// Export the feature collection to Google Drive
Export.table.toDrive({
  collection: thailandBorder,
  description: 'CM_Province_Export',
  fileFormat: 'SHP'
});
```

#### 9.3 Export an image to Google Earth Engine assets
```javascript
// 19. Export an image to Google Earth Engine assets
var polygon = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]);
var s2 = ee.ImageCollection('COPERNICUS/S2')
           .filterDate('2025-02-01', '2025-06-28')
           .filterBounds(polygon);
var composite = s2.median();
// Select bands for NDVI calculation
var nirBand = composite.select('B8');  // NIR band
var redBand = composite.select('B4');  // Red band
// Calculate NDVI
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
// Add NDVI to the composite
var compositeWithNDVI = composite.addBands(ndvi);
// Export the NDVI image to Google Earth Engine assets
Export.image.toAsset({
  image: compositeWithNDVI.select('NDVI'),
  description: 'NDVI_Export_Asset',
  assetId: 'projects/your_project/assets/NDVI_Export_Asset', // Change 'your_project' to your project ID
  scale: 30,
  region: polygon,
  maxPixels: 1e13
});
```