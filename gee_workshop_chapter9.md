### Flood Detection using Sentinel-1 SAR Data

#### Credit: UN-SPIDER [text](https://www.un-spider.org/advisory-support/recommended-practices/recommended-practice-flood-mapping/step-by-step)

#### Define the region of interest
```javascript
// 1. Define region of interest (adjust coordinates as needed)
var geometry = ee.Geometry.Polygon(
        [[[99.78173820585737, 20.530460641212706],
          [99.78173820585737, 20.343223656107035],
          [100.15664665312299, 20.343223656107035],
          [100.15664665312299, 20.530460641212706]]]);

// 2. Define the area of interest as a FeatureCollection
var aoi = ee.FeatureCollection(geometry);
```
#### Load Sentinel-1 data and filter by date
```javascript
// 3. Define date ranges for before and after flood events
var before_start = '2024-01-01';
var before_end = '2024-05-24';
var after_start = '2024-09-15';
var after_end = '2024-10-10';
```
#### Load and filter Sentinel-1 data 
```javascript
// 4. Define parameters for Sentinel-1 data
var polarization = "VH"; // 'VV'  'VH' 
var pass_direction = "DESCENDING"; // 'DESCENDING' หรือ 'ASCENDING'
// Load and filter Sentinel-1 GRD  
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filter(ee.Filter.eq('instrumentMode', 'IW'))
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization))
    .filter(ee.Filter.eq('orbitProperties_pass', pass_direction))
    .filter(ee.Filter.eq('resolution_meters', 10))
    //.filter(ee.Filter.eq('relativeOrbitNumber_start',relative_orbit ))
    .filterBounds(aoi)
    .select(polarization);
// Filter date
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start, after_end);

// Create mosaics for before and after periods
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);
```
#### Calculate the difference in backscatter
```javascript
// 5. Calculate the difference in backscatter between the two periods
var smoothing_radius = 25;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');
// Define a threshold for flood detection
var difference_threshold = -5.5;
var difference_db = after_filtered.subtract(before_filtered);
var difference_binary = difference_db.lte(difference_threshold);
var flood_raw_mask = difference_db.updateMask(difference_binary);
```
#### Refine the flood mask using additional criteria
```javascript
// 6. Refine the flood mask using additional criteria
var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
var swater_mask = swater.gte(5).updateMask(swater.gte(5));
var flooded_mask = difference_binary.where(swater_mask, 0);
var flooded = flooded_mask.updateMask(flooded_mask);
var connections = flooded.connectedPixelCount();
var flooded = flooded.updateMask(connections.gte(8));
var dem = ee.Image('WWF/HydroSHEDS/03VFDEM');
var terrain = ee.Algorithms.Terrain(dem);
var slope = terrain.select('slope');
var flooded = flooded.updateMask(slope.lt(5));
```
#### Display the results    
```javascript
// 7. Display the results
Map.centerObject(aoi);
Map.addLayer(before_filtered, { min: -25, max: 0 }, 'Before Flood', 0);
Map.addLayer(after_filtered, { min: -25, max: 0 }, 'After Flood', 1);
Map.addLayer(difference_db, { min: -5, max: 5 }, 'Difference (dB)', 0);
Map.addLayer(flood_raw_mask, { palette: 'blue' }, 'Flooded (raw)', 0);
Map.addLayer(flooded, { palette: 'blue' }, 'Flooded Areas', 1);
```


### Drought Monitoring using CHIRPS Precipitation Data
#### Load Thailand boundary and CHIRPS data
```javascript
// 1. Load Thailand boundary
var thailand = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
    .filter(ee.Filter.eq('country_na', 'Thailand'));

// 2. Load CHIRPS monthly precipitation and select the ‘precipitation’ band
var precip = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    .select('precipitation');
```
#### Calculate Standardized Precipitation Index (SPI) for 3-month periods
```javascript
// 3. Define the “current” 3-month period ending April 2025
var targetDate = ee.Date('2024-01-01');
var startPeriod = targetDate.advance(3, 'month');
print(startPeriod);
var current3mo = precip
    .filterDate(targetDate, startPeriod)
    .sum();
```
#### Build a time series of historical 3-month sums
```javascript
// 4. Build a time series of historical 3-month sums (April–June each year)
var years = ee.List.sequence(1981, 2023);
var historical3mo = ee.ImageCollection.fromImages(
    years.map(function (y) {
        var start = ee.Date.fromYMD(y, 1, 1);  //.advance(3, 'month');  // window start = April 1
        var end = start.advance(3, 'month');

        return precip
            .filterDate(start, end)
            .sum()
            .set('system:time_start', start.millis());
    })
);
print(historical3mo);
```
#### Compute mean and standard deviation images from the historical period
```javascript
// 5. Compute mean and standard deviation images from the historical period
var mean3mo = historical3mo.mean();
var stddev3mo = historical3mo.reduce(ee.Reducer.stdDev());
print(mean3mo);
```
#### Calculate the SPI-3 (approximate) as standardized anomaly
```javascript
// 6. Calculate the SPI-3 (approximate) as standardized anomaly
var spi3 = current3mo
    .subtract(mean3mo)
    .divide(stddev3mo)
    .clip(thailand);
```
#### Visualization parameters for SPI
```javascript
// 7. Visualization parameters for SPI
var spiVis = {
    min: -2,
    max: 2,
    palette: [
        '#d73027', // <= -1.5 (severe drought)
        '#fc8d59', // -1.5 to -1.0
        '#fee08b', // -1.0 to -0.5
        '#d9ef8b', // -0.5 to 0.5 (near normal)
        '#91cf60', // 0.5 to 1.0
        '#1a9850'  // > 1.0 (wet)
    ]
};
```
#### Display the SPI layer and add a legend
```javascript
// 8. Display the SPI layer
Map.centerObject(thailand, 6);
Map.addLayer(spi3, spiVis, 'SPI-3 Apr 2024');

// 9. Add a legend panel
var legend = ui.Panel({
    style: {
        position: 'bottom-left',
        padding: '8px 15px',
        backgroundColor: 'white',
        fontWeight: 'bold'
    }
});
legend.add(ui.Label('SPI-3 Legend'));

var makeRow = function (color, name) {
    var colorBox = ui.Label({
        style: {
            backgroundColor: color,
            padding: '8px',
            margin: '0 0 4px 0'
        }
    });
    var description = ui.Label(name, { margin: '0 0 4px 6px' });
    return ui.Panel([colorBox, description], ui.Panel.Layout.Flow('horizontal'));
};

var palette = spiVis.palette;
var names = ['<= -1.5', '-1.5 to -1.0', '-1.0 to -0.5',
    '-0.5 to 0.5', '0.5 to 1.0', '> 1.0'];

palette.forEach(function (color, i) {
    legend.add(makeRow(color, names[i]));
});

Map.addLayer(current3mo.clip(thailand), { min: 0, max: 400, palette: ['#FFFFFF', '#ADD8E6', '#0000CD', '#00008B'] }, 'current-rain');
Map.addLayer(historical3mo.mean().clip(thailand), { min: 0, max: 500, palette: ['#FFFFFF', '#ADD8E6', '#0000CD', '#00008B'] }, '3m-rain');
Map.add(legend);
```