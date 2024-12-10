export default {
	loadUserData: async ()  => {
		return await GetUserProfile.run(async data => {
			await storeValue('enlace_profile_data', data[0]);
			return true;
		});
	}
}