export default {
	handleNavigation () {
		if(Table1.selectedRow.estado == "editable"){
			navigateTo('GcSaveOrChange', {
				"GcHeaderId": Table1.selectedRow.id
			});
		}else{
			navigateTo('GcDetailView', {
				"GcHeaderId": Table1.selectedRow.id
			});
		}
		
	}
}