export default {
	dptosList: () => {
		return GetDptosComunidad.data.map((row) => {
			return {"label": row["numero"], "value": row["id"]};
		});
	},

	findDptoById: (dpto_id) => {
		const dpto_list = this.dptosList();
		let dpto = dpto_list.find((row)=>{
			return row["value"] == dpto_id;
		});
		return (dpto) ? dpto["label"] : "";
	}
}