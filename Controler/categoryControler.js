'use strict'

const isEmpty = require('lodash.isempty')
const resp = require('./../Database/response');
const con = require('./../Database/connection');
const Joi = require('joi');

exports.show = function (req, res){
	let search = req.query.search;
	let page = req.query.page || 1;
	let limit = parseInt(req.query.limit)|| 10;

	let sql='select id, title, note, date_note as date, category,  note.id_category from note join category on note.id_category = category.id_category'

	if (!isEmpty(search)) {
		
		sql += ` where category.id_category = '${search}'`
		let sqldef = sql

		if (page){
			var start = (page * limit) - limit;

			if (start === limit) {
				start == limit + 1;
			}

			sql += ` limit ${start}, ${limit}`;           
		}

		con.query(sql, function (error, rows, field){
		if (error) {
			console.log(error);
		}else{
			con.query(sqldef, function(error, raw){
				if(error){
					console.log(error);
				}else{
					res.send({
						status:200,
						data: rows,
						totalPage: Math.ceil(raw.length/limit),
						TotalData: raw.length,
						Limit: limit,
						page: page,
						sql: sql 
					})
				}
			})
		}
		});

	}else{
		sql = 'select * from category'
			con.query(sql, function (error, rows, field){
			if (error) {
				console.log(error);
			}else{
				resp.ok(rows, res);
			}
			});
	}
}

exports.showById = function (req, res){
	con.query(`select * from category where id_category = ${req.params.id}`, function (error, rows, fiels){
		if (error) {
			console.log(error);
		}else{
			if (rows == "") {
				res.send({
					message: "data not found!"
				});

			}else{
				resp.ok(rows, res);	
			}
			
		}
	});
}

exports.add = function (req, res){
	let category = req.body.category;
	let image = req.body.image;

	const schema = {
		category : Joi.string().required(),
		image : Joi.string().required(),
	};

	const result = Joi.validate(req.body, schema);

	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	}else{
		con.query('insert into category set category=?, image=?', [category, image], function (error, rows, field){
			if (error) {
				console.log(error);
			}else{
				con.query('select * from category order by id_category desc limit 1', function (error, rows, field){
					if (error) {
						console.log(error);
					}else{
						res.send({
							values:rows,
							message: "data has ben saved"
						})
					}
				});
			}
		});
		}
	}

	

exports.update = function(req, res){
	let id = req.params.id;
	let category = req.body.category;

	var sql = `select * from category where id_category = ${id}`;

	con.query(sql, function (error, rows){
		if (rows == "") {
			res.send({
				message: "data not found!"
			});
		}else{
			con.query(`update category set category="${category}" where id_category = ${id}`, function (error, rows, field){
				if (error) {
					console.log(error);
				}else{
					con.query('select * from category', function (error, rows, field){
						if (error) {
							console.log(error);
						}else{
							resp.ok(rows, res);
						}
					});
				}
			});
		}
	});

	
}

exports.delete = function(req, res){
	let id = req.params.id;

	con.query(`delete from category where id_category = ${id}`, function (error, rows, field){
		if (error) {
			console.log(error);
		}else{
			con.query('select * from category', function(error, row){
				if (error) {
					console.log(error)
				}else{
					res.send({
						status:200,
						data: row
					})
				}

			})
		}
	});
}