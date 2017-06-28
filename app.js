var express = require('express');
var mysql = require('mysql');

var app = express();
var bodyParser = require('body-parser');
var pool = mysql.createPool({
	host : 'mysql.eecs.oregonstate.edu',
	user : 'cs290_kaoj',
	password : '4574',
	database : 'cs290_kaoj',
	dateStrings: 'date'
}); 

app.set('port', 4574);
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req,res,next) {
	res.sendfile('index.html');	
});

app.get('/data', function(req,res,next) {
	var context = {};
	pool.query('SELECT * FROM workouts ORDER BY date', function(err,rows,fields) {
		if(err){
			next(err);
			return;
		}
		context.results = JSON.stringify(rows);
		
		res.json(context.results);	
	});
});

app.get('/delete',function(req,res,next){
  pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
	res.status(200).end();
  });
});

app.get('/update', function(req,res,next) {
  pool.query("UPDATE workouts SET name=?, weight=?, reps=?, lbs=?, date=? WHERE id=?",
    [req.query.name, req.query.weight, req.query.reps, req.query.lbs, req.query.date, req.query.id],
    function(err, result){
    if(err){
	next(err);
	return;
    }
    	res.status(200).end();
    });
});


app.post('/',function(req,res,next){
  console.log(req.body);
  pool.query("INSERT INTO workouts(`name`, `weight`, `reps`, `lbs`, `date`) VALUES (?,?,?,?,?)",
	[req.body.name, req.body.weight, req.body.reps, req.body.lbs, req.body.date], 
	function(err, result){
    if(err){
      next(err);
      return;
    }
   res.status(200);
   res.send("Exercise added.");
  });
});



app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "weight INT,"+  
    "reps INT,"+
    "lbs BOOLEAN,"+
    "date DATE)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.json(context.results);
    });
  });
});

app.use(function(req,res){
  res.status(404);
  res.send("Error 404 - Page Is Nowhere to be Found");
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.send("Error 500 - Something Has Gone Terribly Wrong");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});








