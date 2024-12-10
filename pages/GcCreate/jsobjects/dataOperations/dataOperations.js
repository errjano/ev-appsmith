export default {
	handleCreate: () => {
		let gcAlreadyCreated = CheckIfGcExists.run().then(
			(res) => {
				if (res && res[0]) {
					navigateTo("GcSaveOrChange", { "GcHeaderId": res[0].id });
				} else {
					InsertHeaderGC.run().then((res) => {
						navigateTo("GcSaveOrChange", { "GcHeaderId": res[0].id });
					});
				}
			});
		return true;
	}
}