basic JavaScript guide for Google Earth Engine (GEE) development:

### 1. Variables and Data Types
```javascript
// Variable declaration
var number = 42;                  // Number
var text = "Hello, Earth!";       // String
var boolean = true;               // Boolean
var list = [1, 2, 3, 4];          // Array
var object = {key: "value"};      // Object

// Array variable
var array = [1, 2, 3, 4, 5];
// Accessing array elements
var firstElement = array[0];      // 1
// Modifying array elements
array[1] = 10;                   // [1, 10, 3, 4, 5]
// Object variable
var obj = {name: "Earth", age: 4.5};
obj.name = "Mars";              // {name: "Mars", age: 4.5}
// Accessing object properties
var name = obj.name;            // "Mars"
// Modifying object properties
obj.age = 4.6;                 // {name: "Mars", age: 4.6}

// Earth Engine objects
var numList = ee.List([1, 2, 3, 4, 5]);
var image = ee.Image("LANDSAT/LC08/C01/T1/LC08_044034_20140318");
var geometry = ee.Geometry.Point([-122.082, 37.42]);
```

### 2. Comment
```javascript
// Single line comment
/*
Multi-line comment
   This is a multi-line comment
   that spans multiple lines.
*/

```

### 3. Functions
```javascript
// function declaration 
function showMessage() {
    print('Hello, Earth Engine!');
}

// call the function
showMessage();

// Function with parameters
function addNumbers(a, b) {
    return a + b;
}
var sum = addNumbers(5, 10);      // 15

// Earth Engine function
var roi = ee.Geometry.Polygon(
        [[[98.9171009716561, 18.815619476862654],
          [98.9171009716561, 18.68557890893041],
          [99.0873890575936, 18.68557890893041],
          [99.0873890575936, 18.815619476862654]]]);
// Define a function to calculate NDVI for one image
function calcNDVI(image) {
    // Compute normalized difference of bands B8 and B4
    return image.normalizedDifference(['B8', 'B4'])
                .rename('NDVI');
}

// Apply the function to every image in the collection
var collection = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2021-01-01', '2021-01-31')
    .filterBounds(roi);

var ndviCollection = collection.map(calcNDVI);

// Compute the median composite of NDVI
var medianNDVI = ndviCollection.median();

Map.addLayer(medianNDVI, {min: 0, max: 1}, 'Median NDVI');

```

### 4. if…else Statements
```javascript
// Client-side if…else
let x = 7;
let y = 5;

// Simple if-else to compare JS numbers
if (x > y) {
  print('x is greater than y');  // prints: x is greater than y
} else if (x === y) {
  print('x is equal to y');
} else {
  print('x is less than y');
}

// Earth Engine if…else
var image = ee.Image('LANDSAT/LC08/C01/T1/LC08_044034_20140318');
var ndvi = image.normalizedDifference(['B5', 'B4']);
var threshold = 0.5;
var mask = ndvi.gt(threshold);
var maskedImage = image.updateMask(mask);
Map.addLayer(maskedImage, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Masked Image');

// ee.Algorithms.If
var condition = ee.Number(5);
var result = ee.Algorithms.If(condition.gt(0), 'Positive', 'Negative');
print('Result:', result);  // prints: Result: Positive

```

### 5. Loops
```javascript
// Client-side for loop
for (var i = 0; i < 5; i++) {
    print('Iteration:', i);
}

// Client-side while loop
var j = 0;
while (j < 5) {
    print('While loop iteration:', j);
    j++;
}

// map function
var numbers = [1, 2, 3, 4, 5];
var squaredNumbers = numbers.map(function(num) {
    return num * num;
});
print('Squared Numbers:', squaredNumbers);  // [1, 4, 9, 16, 25]

// Server-side for loop
var serverList = ee.List([1, 2, 3, 4, 5]);
var serverSquared = serverList.map(function(num) {
    return ee.Number(num).multiply(ee.Number(num));
});
print('Server Squared:', serverSquared);  // [1, 4, 9, 16, 25]

// Earth Engine map function
var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1');
var ndviCollection = collection.map(function(image) {
    return image.normalizedDifference(['B5', 'B4']).rename('NDVI');
});

```

### 6. Object
```javascript
var Car = {
    wheels: 4,
    door: 2,
    start: function() {
        print('Car started');
        return this;  
    }
};

var tota = Car;
print('Toyota wheels:', tota.wheels);  
tota.color = "red";
print('Tota color:', tota.color);  
tota.start();

var hoda = Car;
hoda.door = 5; 
print('Hoda door:', hoda.door); 

tota.drive = function() {
    print('Car is driving');
    return this;  
};
// tota.drive();  

tota.stop = function() {
    print('Car stopped');
    return this;
};
// tota.stop();  

// chain method calls
tota.start().drive().stop(); 
```

### 7. EE Objects and Methods
#### Earth Engine objects
```javascript
// instance of Earth Engine objects 
var geometry = ee.Geometry.Polygon(
    [[[98.9171009716561, 18.815619476862654],
      [98.9171009716561, 18.68557890893041],
      [99.0873890575936, 18.68557890893041],
      [99.0873890575936, 18.815619476862654]]]); 

// create a feature with properties
var feature = ee.Feature(geometry, {name: 'Chiang Mai'});
print('Feature:', feature);  

// methods of Earth Engine objects
var area = feature.geometry().area(); 
print('Area:', area);  

// Map methods
Map.centerObject(feature, 10); 
Map.addLayer(feature, {color: 'red'}, 'Feature'); 
```
#### Earth Engine objects for image and image collection
```javascript
// instance of Earth Engine objects for image 
var image = ee.Image('LANDSAT/LC09/C02/T1_TOA/LC09_131047_20240103');
// methods of Earth Engine objects for image
var bandNames = image.bandNames();
print('Band names:', bandNames); 
var bandCount = image.bandNames().length();
print('Band count:', bandCount); 
var band4 = image.select('B4');
print('Band 4:', band4);  

Map.centerObject(image, 10);
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3000}, 'RGB');

// instance of Earth Engine objects for image collection
var dataset = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
    .filterDate('2024-01-01', '2024-03-30') // Filter method by date;
var trueColor432 = dataset.select(['B4', 'B3', 'B2']);
var trueColor432Vis = {
  min: 0.0,
  max: 0.4,
};
Map.setCenter(98.9616, 18.7137);
Map.addLayer(trueColor432, trueColor432Vis, 'True Color (432)');  
```

### 8. Method Chaining
```javascript
// Non-chaining methods
var image = ee.Image('LANDSAT/LC09/C02/T1_TOA/LC09_131047_20240103');
var band4 = image.select('B4');
var band3 = image.select('B3');
var band2 = image.select('B2');
var rgb = band4.addBands(band3).addBands(band2);
image.select(['B4', 'B3', 'B2'])
Map.centerObject(image, 10);
Map.addLayer(image, {min: 0, max: 3000}, 'RGB');

// Chaining methods for image collection
var collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA')
    .filterDate('2024-01-01', '2024-03-30')
    .filterBounds(geometry)
    .select(['B4', 'B3', 'B2'])
    .mean();
Map.centerObject(geometry, 10);
Map.addLayer(collection, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Mean Image');

// Chaining methods with functions
function calculateNDVI(image) {
    return image.normalizedDifference(['B8', 'B4']).rename('NDVI');
}
var filtered = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2021-01-01', '2021-01-31')
    .filterBounds(geometry)
    .map(calculateNDVI)
    .select('NDVI')
    .mean();
Map.centerObject(geometry, 10);
Map.addLayer(filtered, {min: 0, max: 1}, 'Mean NDVI');

```