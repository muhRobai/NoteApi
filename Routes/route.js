'use strict'

module.exports = function (app){
	const control = require('./../Controler/noteController');
	const controlCategory = require('./../Controler/categoryControler');

	app.get('/', control.welcome);
	app.get('/notes', control.note);
	app.get('/notes/:id', control.noteById);
	app.post('/notes', control.add);
	app.patch('/notes/:id', control.update);
	app.delete('/notes/:id', control.delete);
	app.get('/categories', controlCategory.show);
	app.get('/categories/:id', controlCategory.showById);
	app.post('/categories', controlCategory.add);
	app.patch('/categories/:id', controlCategory.update);
	app.delete('/categories/:id', controlCategory.delete);
}