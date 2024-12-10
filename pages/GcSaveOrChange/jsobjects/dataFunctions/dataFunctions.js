export default {
	gcOutboundTypeList: () => {
		let output = [];
		output = GetGcTypesOutbound.data.map((row) => {
			return {"label": row["descripcion"], "value": row["id"]};
		})
		return output;
	},
	gcInboundTypeList: () => {
		let output = [];
		output = GetGcTypesInbound.data.map((row) => {
			return {"label": row["descripcion"], "value": row["id"]};
		})
		return output;
	},

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
	},

	getStatusDescription: (status_slug) => {
		let statusList = {
			"egreso": "Egreso comun comunidad",
			"ingreso": "Ingreso comun comunidad",
			"egreso_directo": "Egreso directo por unidad"
		}
		return statusList[status_slug] ?? status_slug;
	},

	getStatusDescriptionList: () => {
		return [
			{"value": "egreso", "label": "Egreso comun comunidad"},
			{"value": "ingreso", "label": "Ingreso comun comunidad"},
			{"value": "egreso_directo", "label": "Egreso directo por unidad"},
		];
	},

	processCsv: (tipo_movimiento = "egreso") => {
		const user_id = appsmith.store.suapabase_auth.user.id;
		const gc_cabecera_id = appsmith.URL.queryParams.GcHeaderId;
		const dpto_list = this.dptosList();
		OutboundFilePicker.files[0].data.map((row) => {
			let parsed_row = row;
			parsed_row["departamento_id"] = null;
			parsed_row["tipo_movimiento"] = tipo_movimiento;
			parsed_row["gc_cabecera_id"] = gc_cabecera_id;
			parsed_row["user_id"] = user_id;
			if(row.departamento){
				let dpto_id = dpto_list.find((dpto)=>{ return dpto["label"] == row.departamento; });
				if(dpto_id){
					parsed_row["departamento_id"] = dpto_id["value"];
					parsed_row["tipo_movimiento"] = "egreso_directo";
				}else if(row.departamento == "general"){
					parsed_row["tipo_movimiento"] = "egreso_directo";
				}
			}
			insertMovimientoRow.run({
				monto: parsed_row["monto"],
				glosa: parsed_row["glosa"],
				descripcion: parsed_row["descripcion"],
				user_id: parsed_row["user_id"],
				departamento_id: parsed_row["departamento_id"],
				gc_cabecera_id: parsed_row["gc_cabecera_id"],
				tipo_movimiento: parsed_row["tipo_movimiento"]
			});
		});
	},

	generateGcDetail: () => {
		const deptos = GetDptosComunidad.data;
		const summedGc = GetGcSummary.data;
		const summedGcByDpto = GetGcSummaryByDpto.data;
		const headerData = GetGcHeader.data[0];
		const totalOutbound = summedGc.find((r) => {return r["tipo_movimiento"] == "egreso"});
		const totalInbound = summedGc.find((r) => {return r["tipo_movimiento"] == "ingreso"});
		let totalProrratear = Math.ceil(parseFloat(totalOutbound["sum"]) - parseFloat(totalInbound["sum"]));
		let detalleGc = [];
		let dateString = new Date(headerData["anno"], parseInt(headerData["mes"]) - 1).toLocaleDateString('es-es', {year:"numeric", month:"long"});
		deptos.forEach((dpto) => {
			const porcentajeProrrateo = (dpto["porcentaje_prorrateo"]) ? parseFloat(dpto["porcentaje_prorrateo"]) : 0;
			let directOutboundDpto = summedGcByDpto.find((row)=>{ return (row["departamento_id"] == dpto["id"]) && (row["tipo_movimiento"] == "egreso_directo")});
			let directOutboundGlobal = summedGcByDpto.find((row)=>{ return (row["departamento_id"] == "99999") && (row["tipo_movimiento"] == "egreso_directo")});
			let saldoFavor = summedGcByDpto.find((row)=>{ return (row["departamento_id"] == dpto["id"]) && (row["tipo_movimiento"] == "ingreso")}) ?? 0;
			let saldoContra = totalProrratear * porcentajeProrrateo;
			if(directOutboundDpto){
				saldoContra = saldoContra + parseFloat(directOutboundDpto["sum"]);
			}
			if(directOutboundGlobal){
				saldoContra = saldoContra + parseFloat(directOutboundGlobal["sum"]);
			}
			detalleGc.push({
				"saldo_favor": Math.ceil(saldoFavor),
				"saldo_contra": Math.ceil(saldoContra),
				"total_mes": Math.ceil(saldoContra - saldoFavor),
				"gc_cabecera_id": headerData["id"],
				"month": headerData["mes"],
				"year": headerData["anno"],
				"porcentaje_prorrateo": porcentajeProrrateo,
				"departamento_id": dpto["id"],
				"comentario": `Resumen gasto comun ${dateString} Departamento ${dpto["numero"]} comunidad ${appsmith.store.enlace_profile_data.nombrecomunidad}`
			});
			InsertDetalleRow.run({
				"saldo_favor": Math.ceil(saldoFavor),
				"saldo_contra": Math.ceil(saldoContra),
				"actual_mes": Math.ceil(saldoContra - saldoFavor),
				"porcentaje_prorrateo": porcentajeProrrateo,
				"month": headerData["mes"],
				"year": headerData["anno"],
				"comentario": `Resumen gasto comun ${dateString} Departamento ${dpto["numero"]} comunidad ${appsmith.store.enlace_profile_data.nombrecomunidad}`,
				"departamento_id": dpto["id"],
				"gc_cabecera_id": headerData["id"]
			});
		});
		let updateResult = UpdateHeader.run({
			"new_status": "generado",
			"gc_cabecera_id": headerData["id"]
		});

	}
}