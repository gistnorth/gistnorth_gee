### 8.1 Land use and Land Cover Classification with Google Earth Engine

#### 1.Define region of interest and load training data
```javascript
// 1. Supervised land-use classification (5 classes) using Sentinel-2 at two time periods
var roi  = ee.Geometry.Polygon([[[98.65287970599341, 17.722345177988142],
          [98.65287970599341, 17.518162943397694],
          [98.91105841693091, 17.518162943397694],
          [98.91105841693091, 17.722345177988142]]]);
```
#### 2.Load training data
```javascript
// 2. Load training data (FeatureCollection of points or polygons with a property 'landcover' 0–4)
//    You must prepare this asset with 5 classes: e.g. 0=Water,1=Urban,2=Agriculture,3=Forest,4=Bare
var trainingFC = ee.FeatureCollection("projects/ee-sakda-451407/assets/trainning");

print(trainingFC);

```
#### 3.Load Sentinel-2 data and build composites for two date ranges
```javascript

// 3. Load Sentinel-2 and build composites for two date ranges
var start1 = '2019-01-01', end1 = '2019-01-31';
var start2 = '2025-01-01', end2 = '2025-01-31';

function makeComposite(start, end) {
  return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterDate(start, end)
    .filterBounds(roi)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    .median()
    .clip(roi);
}

var comp1 = makeComposite(start1, end1);
var comp2 = makeComposite(start2, end2);
```
#### 4.Select spectral bands, sample training data, train classifiers, and classify images
```javascript
// 4. Select spectral bands for classification
var bands = ['B2','B3','B4','B8','B11','B12'];  // Blue, Green, Red, NIR, SWIR1, SWIR2
```
#### 5.Sample the composites at the training points
```javascript
// 5. Sample the composites at the training points
var samples1 = comp1.select(bands).sampleRegions({
  collection: trainingFC,
  properties: ['landcover'],
  scale: 10,
  geometries: true
});

var samples2 = comp2.select(bands).sampleRegions({
  collection: trainingFC,
  properties: ['landcover'],
  scale: 10,
  geometries: true
});
```
#### 6.Train classifiers and classify the composites
```javascript
// 6. Train classifiers (Random Forest) for each period
var classifier1 = ee.Classifier.smileRandomForest(100)
                    .train({
                      features: samples1,
                      classProperty: 'landcover',
                      inputProperties: bands
                    });

var classifier2 = ee.Classifier.smileRandomForest(100)
                    .train({
                      features: samples2,
                      classProperty: 'landcover',
                      inputProperties: bands
                    });
```
#### 7.Classify the composites and define a color palette
```javascript
// 7. Classify the composites
var classified1 = comp1.select(bands).classify(classifier1);
var classified2 = comp2.select(bands).classify(classifier2);
```
#### 8.Define a color palette for visualization
```javascript
// 8. Define a 4-class palette
var palette = [
  '0000FF',  // 0 = Water (blue)
  'FF0000',  // 1 = Urban (red)
  '00FF00',  // 2 = Agriculture (green)
  '007F00',  // 3 = Forest (dark green)
];
```
#### 9.Display the results
```javascript
// 9. Display the results
Map.centerObject(roi);
Map.addLayer(comp1, {bands: ['B4','B3','B2'], min:0, max:3000}, 'True Color 1', false);
Map.addLayer(classified1, {min:0, max:3, palette: palette}, 'Classified Jan–Mar', true);

Map.addLayer(comp2, {bands: ['B4','B3','B2'], min:0, max:3000}, 'True Color 2', false);
Map.addLayer(classified2, {min:0, max:3, palette: palette}, 'Classified Jul–Sep', true);
```
#### 10.Optional: accuracy assessment for the first period
```javascript
// 10. Optional: accuracy assessment for period 1
var trainTest1 = samples1.randomColumn('rnd', 42);
var split = 0.7;
var trainSet = trainTest1.filter(ee.Filter.lt('rnd', split));
var testSet  = trainTest1.filter(ee.Filter.gte('rnd', split));

var trainedRF = ee.Classifier.smileRandomForest(100)
                .train({features: trainSet, classProperty: 'landcover', inputProperties: bands});

var validated = testSet.classify(trainedRF);

var testAccuracy = validated.errorMatrix('landcover', 'classification');
print('Confusion matrix (1st period):', testAccuracy);
print('Overall accuracy:', testAccuracy.accuracy());

```
#### 11.Perform Change Detection
```javascript
// 11. Perform Change Detection
// 11.1 สร้างภาพที่แสดงการเปลี่ยนแปลงแบบ "จาก-ไป" (From-To Change)
// โดยนำค่า class จาก classified1 คูณ 100 แล้วบวกด้วยค่า class จาก classified2
// เพื่อให้ได้ค่าที่ไม่ซ้ำกันสำหรับแต่ละคู่ของการเปลี่ยนแปลง เช่น ป่าไม้(3) ไป เมือง(1) จะเป็น 301
// น้ำ(0) ไป เกษตร(2) จะเป็น 2
// ป่าไม้(3) คงเดิมเป็น ป่าไม้(3) จะเป็น 303
var fromToChange = classified1.multiply(100).add(classified2);

// แสดงผลภาพ "from-to change" แบบดิบ (อาจจะต้องปรับ min/max หรือใช้ palette ที่เหมาะสมหากต้องการแสดงทุกการเปลี่ยนแปลง)
Map.addLayer(fromToChange, {min:0, max:404, palette: ['grey', 'yellow', 'orange', 'red']}, 'From-To Change (Raw)', false);

// 11.2 แสดงตัวอย่างการเน้นการเปลี่ยนแปลงเฉพาะบางประเภท
// เช่น การเปลี่ยนแปลงจาก ป่าไม้ (class 3) ไปเป็น พื้นที่เมือง (class 1)
var forestToUrban = fromToChange.eq(301); // 3*100 + 1 = 301
Map.addLayer(forestToUrban.selfMask(), {palette: ['FF00FF']}, 'Change: Forest to Urban', true);

// เช่น การเปลี่ยนแปลงจาก พื้นที่เกษตร (class 2) ไปเป็น พื้นที่เมือง (class 1)
var agricultureToUrban = fromToChange.eq(201); // 2*100 + 1 = 201
Map.addLayer(agricultureToUrban.selfMask(), {palette: ['FFA500']}, 'Change: Agriculture to Urban', false);

// เช่น พื้นที่ที่ไม่มีการเปลี่ยนแปลง และยังคงเป็น ป่าไม้ (class 3)
var stableForest = fromToChange.eq(303); // 3*100 + 3 = 303
Map.addLayer(stableForest.selfMask(), {palette: ['004D00']}, 'Stable: Forest', false);

// 11.3 สร้างภาพการเปลี่ยนแปลงแบบ Binary (มีการเปลี่ยนแปลง / ไม่มีการเปลี่ยนแปลง)
// โดยที่ 1 หมายถึงมีการเปลี่ยนแปลง, 0 หมายถึงไม่มีการเปลี่ยนแปลง
var binaryChange = classified1.neq(classified2);

// แสดงผลภาพ binary change (พื้นที่สีแดงคือมีการเปลี่ยนแปลง)
Map.addLayer(binaryChange.selfMask(), {palette: ['FF0000']}, 'Binary Change (Any Change)', true);

// 12. (เพิ่มเติม) คำนวณพื้นที่ของการเปลี่ยนแปลงแต่ละประเภท (ตัวอย่าง)

// สร้างฟังก์ชันสำหรับคำนวณพื้นที่
function calculateArea(image, geometry, scale) {
  var areaImage = image.multiply(ee.Image.pixelArea());
  var area = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: scale,
    maxPixels: 1e13
  });
  return ee.Number(area.get(image.bandNames().get(0))).divide(10000); // m^2 to hectares
}

// คำนวณพื้นที่ที่เปลี่ยนจากป่าไม้เป็นเมือง
var areaForestToUrban_ha = calculateArea(forestToUrban, roi, 10);
print('Area changed from Forest to Urban (hectares):', areaForestToUrban_ha);

// คำนวณพื้นที่ที่มีการเปลี่ยนแปลงทั้งหมด (binary change)
var areaAnyChange_ha = calculateArea(binaryChange, roi, 10);
print('Total area with any change (hectares):', areaAnyChange_ha);
