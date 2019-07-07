const cors = require('cors');
require('dotenv/config');
const expres = require('express');
const app = expres();
const bodyPanser = require('body-parser');
const route = require('./Routes/route');

const port = process.env.PORT || 3001;

// let whitelist = [
// 	'http://192.168.100.55',
// 	'http://192.168.100.83',
// 	'http://localhost:3001',
// 	'*'
// ];

const corsOption ={
	origin: function(origin, callback){
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		}else{
			callback(new Error('Not allowed by CORS'))
		}
	}
};

app.use(
	bodyPanser.urlencoded({
		extends: true,
	})
);

app.use(bodyPanser.json());
app.use(cors());

route(app);
app.listen(port);

console.log(`Can access in port ${port}`);