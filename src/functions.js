var $ = require('jquery');

const getUrlParameter = function(sParam) {
	var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
	return false;
};

const getUniversityDetails = function(data) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: 'https://backend.icedalnusa.com/API/showUniversityDetails',
			method: 'POST',
			data: {
				id: data
			},
			success: function(resp) {
				resolve(resp);
			},
			error: function(err) {
				reject(err);
			}
		});
	});
};

export { getUniversityDetails, getUrlParameter };
