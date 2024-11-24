import api from "@/lib/axios";

// Fetch all users
export const getUsers = async () => {
	try {
		const response = await api.get('/admin/getUsers');
		return response.data.users.reverse();
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error; // Handle or rethrow error
	}
};

// Fetch all tournaments
export const getTours = async () => {
	try {
		const response = await api.get('/tour/admin/getTournaments');
		return response.data.tours.reverse();
	} catch (error) {
		console.error("Error fetching tournaments:", error);
		throw error;
	}
};

// Fetch all matches (ensure the endpoint is correct)
export async function getMatches() {
	try {
		const response = await api.get('/match/admin/getMatches');
		console.log(response.data.matches)// Ensure this endpoint is correct
		return response.data.matches.reverse();
	} catch (error) {
		console.error("Error fetching matches:", error);
		throw error;
	}
}


export async function verifyToken(payload: {
	token: string
}) {
	try {
		const response = await api.get(`/match/admin/tourCheck/${payload.token}`);
		console.log(response.data)// Ensure this endpoint is correct
		return response.data;
	} catch (error) {
		console.error("Error fetching matches:", error);
		throw error;
	}
}


export async function getCoaches() {
	try {
		const response = await api.get(`/coach/getCoaches/all`);
		console.log(response.data)
		return response.data.coaches.reverse();
	} catch (error) {
		console.error("Error getting coach:", error);
		throw error;
	}
}


export async function getPlans() {
	try {
		const response = await api.get(`/plan/getPlans`);
		console.log(response.data.plans)
		return response.data.plans;
	} catch (error) {
		console.error("Error getting coach:", error);
		throw error;
	}
}


export async function getLeaders(){
	try{
		const response = await api.get(`/leader/getLeaders`);
		console.log(response.data.leaders)
		return response.data.leaders.reverse();
	} catch (error){
		console.error("Error getting leaders:", error);
		throw error;
	}
}


export async function createLeaders(payload){
	try{
		const response = await api.post(`/leader/createLeaders`, payload);
		console.log(response.data)
		return response.data.leaders;
	} catch (error){
		console.error("Error creating leaders:", error);
		throw error;
	}
}