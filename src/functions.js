import Swal from "sweetalert2";

const showLoader = function (stat) {

	if (stat) {
		Swal.fire({
			title: 'Loading...',
			text: 'Please Wait',
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			}
		})
	} else {
		Swal.close()
	}
}

const escapeHtml = function (str) {
	const div = document.createElement('div')
	div.textContent = str
	return div.innerHTML
}

function timeAgo(ts) {
	const diffSec = Math.floor((Date.now() - ts) / 1000);
	if (diffSec < 60) return `${diffSec} detik lalu`;

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin} menit lalu`;

	const diffHour = Math.floor(diffMin / 60);
	if (diffHour < 24) return `${diffHour} jam lalu`;

	const diffDay = Math.floor(diffHour / 24);
	return `${diffDay} hari lalu`;
}

const getUrlParameter = function (sParam) {
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
}

const getUniversityDetails = function (data) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: 'https://backend.icedalnusa.com/queue/get-university',
			method: 'POST',
			data: JSON.stringify(data),
			success: function (resp) {
				resolve(resp);
			},
			error: function (err) {
				reject(err);
			}
		});
	});
};

export { escapeHtml, timeAgo, getUniversityDetails, getUrlParameter, showLoader };
