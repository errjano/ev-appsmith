export default {
	continue: async () => {
		if(!appsmith.URL.fullPath.includes("#access_token")) return;
		return appsmith.URL.fullPath.split("#")[1].split("&").forEach(param => {
			const [k,v] = param.split("=");
			storeValue(k,v);
		});
	},
	triggerLogin: async () => {
		return await SupabaseLogin.run(async data => {
			await storeValue('suapabase_auth_user_id', data.user.id);
			await storeValue('suapabase_auth', data);
			navigateTo('Landing page');
		}, e=>showAlert(e.error_description));
	}
}