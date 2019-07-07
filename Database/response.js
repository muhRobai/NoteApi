'use strict'

exports.ok = function (values, res){
	const data = {
		status: 200,
		values: values
	}

	res.json(data);
	res.end();
};

exports.page = function (value, res){
	const data = {
		status: 200,
		data: value[0],
		total: value[1],
		page: value[2],
		totalPage: value[3],
		limit: value[4]
	}
}