export default {
	yearList () {
		const currentYear = new Date().getFullYear();
		var startYear = currentYear - 10;
		var yearList = [];
		for(var i=startYear; i<=currentYear; i++){
			yearList.push({"code": i, "value": i});
		}
		return yearList.reverse();
	}
}