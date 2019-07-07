'use strict'
const isEmpty = require('lodash.isempty');
const Joi = require('joi');
const response = require('./../Database/response');
const con = require('./../Database/connection');
const moment = require('moment');

exports.welcome = function (req, res){
	response.ok('welcome',res);
}

exports.note = function (req, res){
	let search = req.query.search;
	let sort = req.query.sort || "desc";
	let page = req.query.page || 1;
	let pageReport = parseInt(page) || 1;
	let limit = parseInt(req.query.limit)|| 10;

	let data = [];



	let sql =  "select id, title, note, date_note as date, category,  note.id_category from note left join category on note.id_category = category.id_category";
	let default_sql =  "select id, title, note, date_note as date, category,  note.id_category from note left join category on note.id_category = category.id_category order by date_note desc limit 10";

	if (!isEmpty(search)) {
		sql += ` where title like '%${search}%'`
	}

	if (sort === 'desc') {
		sql += ' order by date_note desc'
	}else if(sort === 'asc'){
		sql += ' order by date_note asc'
	}else{
		return res.send({
			message : ' please insert sort asc || desc'
		});
	}



	if (page){
		var sqlDefPage = sql;
		var start = (page * limit) - limit;

		if (start === limit) {
			start == limit + 1;
		}

		sql += ` limit ${start}, ${limit}`;
                    
	}


	if (isEmpty(search) && isEmpty(sort) && isEmpty(page)) {
		con.query (default_sql, function (error, rows, field){
			if (error) {
				console.log(error);
			}else{

				if (isEmpty(rows)) {
					res.json({
						status: 404,
						message: "data not Found "
					});
				}else{
					//response.ok (rows, res);
					console.log("masuk sini gan")
					var sqldef = 'select * from note';
					con.query(sqldef, function(error, raw){
						if (error) {
							console.log(error);
						}else{
							res.status(200).json({
								status:200,
								data: rows,
								totalPage: Math.ceil(raw.length/limit),
								TotalData: raw.length,
								Limit: limit,
								page: pageReport,
								sql: sql 
							});
						}
						
					});
					
				}
			}
		});


	}else{
		if (!isEmpty(page)) {
			con.query (sql, function (error, rows, field){
				if (error) {
					console.log(error);
				}else{
					//response.ok (rows, res);
					console.log("masuk sini loh")
					con.query(sqlDefPage,function (error, row){
						if (error) {
							console.log(error);
						}else{
							res.status(200).json({
								status:201,
								data: rows,
								totalPage: Math.ceil(row.length/limit),
								TotalData: rows.length,
								Limit: limit,
								page: pageReport, 
								sql: sql 
							});
						}
						
					});
				}
			});
		}else{
			con.query (sql, function (error, rows, field){
				if (error) {
					console.log(error);
				}else{
					//response.ok (rows, res);
					console.log("masuk sini")
					con.query('select * from note',function (error, row){
						if (error) {
							console.log(error);
						}else{
							res.status(200).json({
								status:203,
								data: rows,
								totalPage: Math.ceil(row.length/limit),
								TotalData: row.length,
								Limit: limit,
								page: pageReport, 
								sql: sql 
							});
						}
						
					});
				}
			});
		}	
	}

	
}

exports.noteById = function (req, res){
	let id = req.params.id;
	var sql = `select id, title, note, date_note as date, category,  note.id_category from note left join category on note.id_category = category.id_category where id= ${id}`;
		con.query(sql, function (error, rows, field){
			if (error) {
				console.log(error);
			}else{

				if (rows == "") {
					res.send({
					 message: "Data not Found!"
					});
				}else{
					response.ok(rows, res);	
				}
				
			}
		});
	}

exports.add = function (req, res){
	
	let { title, note, id_category } = req.body;
	let limit = 10	

	const schema = {
		title : Joi.string().required(),
		note : Joi.string().required(),
		id_category: Joi.number()
	};

	const result = Joi.validate(req.body, schema);

	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	}else{
		con.query(`select * from category where id_category = ${id_category}`, function (error, rows, field){
			if (error) {
				console.log(error);
			}else{
				if (rows == "") {
					res.send({
						status: 404,
						message: "Categori Not Found!"
					});
				}else{
					con.query(`insert into note set title=?,note=?,id_category=?`, [title,note,id_category], function (error, rows, field){
						if (error) {
							throw error;
						}else{
							con.query("select id, title, note, date_note as date, category, note.id_category from note left join category on note.id_category = category.id_category order by date_note desc limit 10", function (error, rows, field){
								if (error) {
									throw error;
								}else{
									con.query('select*from note', function(error, raw, field){
										if (error) {
											console.log(error)
										}else{
											res.send({
												status:200,
												data: rows,
												totalPage: Math.ceil(raw.length/limit)
											})
										}

									})
								}
							});
						}
					});	
				}
			}
		});
	}
	
}

exports.update = function (req, res){
	
	let id = req.params.id;
	//var arrbulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];


	let title = req.body.title;
	let note = req.body.note;
	let id_category = req.body.id_category;



	//let { title, note, id_category } = req.body;

	if (isEmpty(title)) {
		var sql = `update note set note = "${note}", date_note = now()`;
	}else if(isEmpty(note)){
		var sql = `update note set title = "${title}", date_note = now()`;
	}else{
		var  sql = `Update note set title = "${title}", note = "${note}", date_note = now()`;
	}

	if (!isEmpty(id_category)) {
		sql+= ` where id = ${id}`
	}else{
		sql += `,id_category = "${id_category}" where id = ${id}`
	}

	//return console.log(sql);
	
	const scheme = {
		title : Joi.string(),
		note : Joi.string(),
		//date : Joi.date(),
		id_category : Joi.number()
	}

	const result = Joi.validate(req.body, scheme);

	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	}else{
		if (isEmpty(id_category)) {
			con.query(sql, function (error, rows, fields){
				if (error) {
					throw error;
				}else{
					con.query("select id, title, note, date_note as date, category, note.id_category from note left join category on note.id_category = category.id_category order by date_note desc limit 10", function (error, rows, field){
						if (error) {
							throw error;
						}else{
							res.send({
								status:200,
								data: rows
							})
						}
					});
				}
			});	
		}else{
			con.query(`select * from category where id_category = ${id_category}`, function (error, rows, field){
				if (error) {
					console.log(error);
				}else{
					if (rows == "") {
						res.send({
							status: 404,
							message: "Category Not Found!"
						});
					}else{
						con.query(sql, function (error, rows, fields){
							if (error) {
								throw error;
							}else{
								con.query("select id, title, note, date_note as date, category, note.id_category from note left join category on note.id_category = category.id_category order by date_note desc limit 10", function (error, rows, field){
									if (error) {
										throw error;
									}else{
										res.send({
											status:200,
											data: rows
										})
									}
								});
							}
						});
					}
				}
			});
		}
	}
}

exports.delete = function (req, res){
	let id = req.params.id;

	const schema = {
		id : Joi.number().required()
	}

	con.query(`select * from note where id = ${id}`, function (error, rows){
		if (rows == "") {
			res.send({
				message: " data not Found!"
			});
		}else{
			con.query(`Delete from note where id = ${id}`, function (error, rows, fields){
				if (error) {
					throw error;
				}else{
					con.query("select id, title, note, date_note as date, category, note.id_category from note left join category on note.id_category = category.id_category order by date_note desc limit 10", function (error, rows, field){
						if (error) {
							throw error;
						}else{
							res.send({
								status:200,
								data: rows
							})
						}
					});
				}
			});	

		}
	});	
}

exports.search = function (req, res){
	let id_category = req.params.title;

	title = req.params.title;
	limit = req.param.limit;

	var sql = `SELECT * FROM note left join category on category.id_category = note.id_category where id_category LIKE '%${id_category}%' order by date_note DESC limit 10 `;

	con.query(sql, function (error, rows, fields){
		if (error) {
			console.log(error);
		}else{
			response.ok(rows, res);	
		}
	});
}