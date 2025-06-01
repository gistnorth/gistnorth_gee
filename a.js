// 1. Load Thailand boundary
var thailand = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
    .filter(ee.Filter.eq('country_na', 'Thailand'));

// 2. Load CHIRPS monthly precipitation and select the ‘precipitation’ band
var precip = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    .select('precipitation');

// 3. Define the “current” 3-month period ending April 2025
var targetDate = ee.Date('2024-01-01');
var startPeriod = targetDate.advance(3, 'month');
print(startPeriod);
var current3mo = precip
    .filterDate(targetDate, startPeriod)
    .sum();

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

// 5. Compute mean and standard deviation images from the historical period
var mean3mo = historical3mo.mean();
var stddev3mo = historical3mo.reduce(ee.Reducer.stdDev());
print(mean3mo);
// 6. Calculate the SPI-3 (approximate) as standardized anomaly
var spi3 = current3mo
    .subtract(mean3mo)
    .divide(stddev3mo)
    .clip(thailand);

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