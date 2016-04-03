var 
  bodyParser  = require('body-parser'), 
  express     = require('express'),
  redis       = require('redis'),
  client,
  app = express();

  client = redis.createClient();

app.set('view engine', 'pug'); //this associates the pug module with the res.render function


app.get(  // method "get"
  '/',    // the route, aka "Home"
  function(req, res) {
    res.render('index', { //you can pass any value to the template here
      pageTitle: 'University Finder' 
    });
  }
);

app.post( // method "post"
  '/', 
  bodyParser.urlencoded({ extended : false }), // this allows us to interept the values POST'ed from the form
  function(req,res,next) {
    var
      latitude  = req.body.latitude,    // req.body contains the post values
      longitude = req.body.longitude;
 
     client.georadius(
      'va-universities',    //va-universities is the key where our geo data is stored
      longitude,            //the longitude from the user
      latitude,             //the latitude from the user
      '100',                //radius value
      'mi',                 //radius unit (in this case, Miles)
      'WITHCOORD',          //include the coodinates in the result
      'WITHDIST',           //include the distance from the supplied latitude & longitude
      'ASC',                //sort with closest first
      function(err, results) {
        if (err) { next(err); } else { //if there is an error, we'll give it back to the user
          //the results are in a funny nested array. Example:
          //1) "longwood-university"        [0]
          //2) "16.0072"                    [1]
          //3)  1) "-78.395833075046539"    [2][0]
          //    2) "37.297776773137613"     [2][1]
          //by using the `map` function we'll turn it into a collection (array of objects)
          results = results.map(function(aResult) {
            var
              resultObject = {
                key       : aResult[0],
                distance  : aResult[1],
                longitude : aResult[2][0],
                latitude  : aResult[2][1]
              };
              
            return resultObject;
          });
          res.render('index', { 
            pageTitle : 'University Finder Results',
            latitude  : latitude,
            longitude : longitude,
            results   : results
          });
        }
      }
    );
    
  }
);

app.listen(3000, function () {
  console.log('Sample store finder running on port 3000.');
});