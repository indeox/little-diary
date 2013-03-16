var fs = require("fs"),
 	util = require("util"),
  xpath = require("xpath"),
  dom = require("xmldom").DOMParser,
  moment = require("moment");



var bookData = [];


var contents = fs.readFileSync("diary.html", "utf8");
var doc = new dom().parseFromString(contents);   
var chaptersDom = xpath.select("//div", doc);


var diaryEntries = {};
var currentYear = 1768, currentMonth = 05, presentDayYear = 2012, startYear = currentYear, startMonth = currentMonth;
var historicalDate, presentDate, historicalDate = moment(), presentDate = moment();

var error = 0, success = 0;
for (var i = 0; i < chaptersDom.length; i++) {
  var chapterDom = new dom().parseFromString(chaptersDom[i].toString());

  var chapterBanner = extractChapterBanner(chapterDom);

  var p = xpath.select("//p", chapterDom);
  for (var j = 0; j < p.length; j++) {
    var paragraphDom = new dom().parseFromString(p[j].toString()); 
    var paragraph = xpath.select("//p/text()", paragraphDom).toString();
    var dates, bookmark, bm;
    if (dates = isDateBookmark(paragraph)) {
      currentMonth = dates[0];
      currentYear = dates[1];
      continue;
    } else if (bm = isBookmark(paragraph)) {
      bookmark = bm;
    }

    extractLocation(paragraph);
    var entryDate = extractDiaryEntryDate(paragraph);
    if (entryDate) {
      historicalDate = moment(currentMonth + " " + entryDate + " " + currentYear);
      presentDate = moment(currentMonth + " " + entryDate + " " + (presentDayYear + (currentYear-startYear)));
    }



    diaryEntries[historicalDate.format("YYYY-MM-DD").valueOf()]  = {
      diary: paragraph,
      date: historicalDate.format("YYYY-MM-DD").valueOf(),
      presentDay: presentDate.format("YYYY-MM-DD").valueOf(),
      weather: decideWeather(paragraph),
      wind: decideWind(paragraph),
      location: extractLocation(paragraph),
      chapter: bookmark,
      chapterBanner: chapterBanner
    };

  }

}

//console.log(diaryEntries)
console.log(JSON.stringify(diaryEntries, null, 4));
function csvLatLong(diaryEntries) {
  var ll = [];
  for (var e in diaryEntries) {
    if (!diaryEntries[e].location) {
      continue;
    }
    if (ll[diaryEntries[e].location[0] + ", " + diaryEntries[e].location[1]]) {
      continue;
    }

    console.log(diaryEntries[e].location[0] + ", " + diaryEntries[e].location[1])
    ll[diaryEntries[e].location[0] + ", " + diaryEntries[e].location[1]] = 1;
  }
}

function extractDiaryEntryDate(text) {

  var dateMatches = text.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d+)/);
  if (dateMatches && dateMatches.length === 3) {
    return dateMatches[2];
  }
}


/*
  latitude 23 degrees 40 North, longitude 40 degrees 4 minutes West
  latitude 1 degree 39 minutes North, longitude 20 degrees 50 minutes West.
  latitude 26 degrees 59 minutes; longitude 309 degrees 6 minutes West, 311 degrees 28 minutes per Observation
  Latitude observed, 5 degrees 55 minutes South
  Latitude of 7 degrees 34 minutes South and Longitude 252 degrees 23 minutes West.
  Latitude of 9 degrees 31 minutes South and Longitude 251 degrees 40 minutes West
  Latitude in 9 degrees 36 minutes South, Longitude 231 degrees 17 minutes West
  latitude 41 degrees 11 minutes, longitude 27 degrees 52 minutes West
Latitude of 7 degrees 34 minutes South and Longitude 252 degrees 23 minutes West.
Latitude by Observation 15 degrees 23 minutes South;
Latitude 16 degrees 6 minutes South, Longitude 214 degrees 39 minutes West.
Latitude of 34 degrees 10 minutes and Longitude 208 degrees 27 minutes West
Latitude of 9 degrees 31 minutes South and Longitude 251 degrees 40 minutes West
latitude 31 degrees 1 minute South; longitude 323 degrees 2 minutes West.
longitude 309 degrees 6 minutes West, 311 degrees 28 minutes per Observation.'
Longitude in 208 degrees 37 minutes West, distance from the nearest shore 6 Miles
  longitude 45 degrees 14 minutes West
longitude 339 degrees 30 minutes per Observation, 329 degrees 17 minutes per Reckoning.
longitude 331 degrees 19 minutes per Observation, 324 degrees 56 minutes per Reckoning
longitude 9 degrees 50 minutes West
latitude 38 degrees 33 minutes North, longitude 10 degrees West
latitude 34 degrees 1 minute North, longitude 14 degrees 29 minutes West
latitude of 32 degrees 33 minutes 33 seconds North and longitude West from Greenwich 16 degrees 49 minutes
latitude 31 degrees 17 minutes, longitude 17 degrees 19 minutes West;
latitude 30 degrees 46 minutes North, longitude 16 degrees 8 minutes South;
latitude 9 degrees 1 minute South, longitude 33 degrees 16 minutes West.
  longitude 45 degrees 14 minutes West
*/
var cachedNorthSouth, cachedWestEast, cachedLatLon;
function extractLocation(diaryEntry) {
  // sea location
  var sentences = diaryEntry.split(/[,;\.]/);
  var lat, lon;
  for (var i = 0; i < sentences.length; i++) {
    var text = sentences[i];

    if (text.match(/per Observation/)) {
      continue;
    }

    var m = text.match(/ongitude(?:[^\d]+)?(\d+) degrees? (\d+)(?: minutes?)? (West|South)?/);
    if (m && m.length) {
      if (m[3]) {
        cachedWestEast = m[3];
      }

      lon = convertDeg(m[1], m[2], cachedWestEast);
    }

    var m = text.match(/atitude(?:[^\d]+)?(\d+) degrees? (\d+)(?: minutes?)? (North|South)?/);
    if (m && m.length) {
      if (m[3]) {
       cachedNorthSouth = m[3];
      } 
      lat = convertDeg(m[1], m[2], cachedNorthSouth);
    } 
  }


  if (lat && lon) {
    cachedLatLon = [lat,lon];
    return cachedLatLon;
  } else {
    return cachedLatLon;
  }

}




function isDateBookmark(text) {
  if (!text) {
    return;
  }
  var m = text.match(/^\[(January|February|March|April|May|June|July|August|September|October|November|December)/);

  if (m && m.length) {
    var mon = m[1], year;
    var m = text.match(/(17\d+)/);
    if (m) {
      year = m[1];
    } 
    return [mon, year];
  }
}


function isBookmark(text) {
  var m;
  if (m = text.match(/^\[(.*)\]$/)) {
    return m[1];
  }
}


function extractChapterBanner(dom) {
  var h2, h3;

  h2 = xpath.select("//h2/text()", dom).toString();
  h3 = xpath.select("//h3/text()", dom).toString();

  return h2 + " " + h3;
}


/*
  degrees
  minutes
  east/west
*/
function convertDeg(deg, min, dir) {
  return dmsToDecimalDeg(deg, min, dir);
}

/* 
  degrees, mins to decimal degrees
*/
function dmsToDecimalDeg(d,m,dir) {
  d = d - 0;
  m = m - 0;
  var sign = (dir == "West" || dir == "South" ) ? -1 : 1;
  return ((m/60)+d)*sign;
}


/*
  Wind South-West by West to West-North-West
  Wind West by North and West-North-West
  Wind West-North-West, calm, East-South-East, South-South-East
  Wind variable, North-North-West, South-West and South
  Wind Westerly
  Wind with some flying showers of hail and rain
  Wind North-West by West, West by South
  Wind Southerly
  Wind Westerly
  Wind South-West by South
  Wind West, Northerly
  Wind North-West, West, and South
  Wind South-South-West
  Wind South-West by West
  Wind South-West by West to West by South
  Wind Westerly
  Wind North-West
  Wind North-Westerly
  Wind North-West, calm
  Wind calm, East-North-East and East-South-East
  Wind and Cloudy
  Wind calm, North-West and West-South-West
  Wind westerly
  Wind West to North-West
  Wind West by South
  Wind Westerly

  extraordinarily crappy way of doing this - but hackday rules apply..
*/

function decideWind(text) {
  var m = text.match(/(Wind ([^;\.]+))/);
  if (m && m.length) {
    var w = m[1];
    if (w.indexOf('Wind South-West') != -1) {
      return 'sw';
    } else if (w.indexOf('Wind North-West') != -1) {
      return 'nw';
    } else if (w.indexOf('Wind North-East') != -1) {
      return 'ne';
    } else if (w.indexOf('Wind South') != -1) {
      return 's';
    } else if (w.indexOf('Wind East') != -1) {
      return 'e';
    } else if (w.indexOf('Wind West') != -1) {
      return 'w';
    } else if (w.indexOf('Wind North') != -1) {
      return 'n';
    } else if (w.indexOf('Wind variable') != -1) {
      return 'v';
    }
  }
  return "";
}

/*
sunny
hazy
cloudy
drizzle
heavy rain
*/
function decideWeather(text) {
  if (text.match(/rain/)) {
    return 'heavy-rain';
  } else if (text.match(/sunny/)) {
    return 'sunny';
  } else if (text.match(/cloudy/)) {
    return 'cloudy';
  } else if (text.match(/(fine|clear) weather/)) {
    return 'hazy';
  } 

  return '';
}