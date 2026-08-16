const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("fasaldirect_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  registerFarmer: (data: any) => apiRequest("/auth/register/farmer", { method: "POST", body: JSON.stringify(data) }),
  registerBuyer: (data: any) => apiRequest("/auth/register/buyer", { method: "POST", body: JSON.stringify(data) }),
  registerAdmin: (data: any) => apiRequest("/auth/register/admin", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiRequest("/auth/me"),

  // Produce
  createProduce: (data: any) => apiRequest("/produce", { method: "POST", body: JSON.stringify(data) }),
  getMyProduce: () => apiRequest("/produce/my"),
  getProduceById: (id: number) => apiRequest(`/produce/${id}`),
  deleteProduce: (id: number) => apiRequest(`/produce/${id}`, { method: "DELETE" }),

  // Teams
  createTeam: (data: any) => apiRequest("/teams", { method: "POST", body: JSON.stringify(data) }),
  findCompatibleTeams: (produceLotId: number) => apiRequest(`/teams/compatible?produce_lot_id=${produceLotId}`),
  getRecentlyCreatedTeams: (produceLotId?: number) => apiRequest(`/teams/recently-created${produceLotId ? `?produce_lot_id=${produceLotId}` : ''}`),
  getMyTeams: () => apiRequest("/teams/my"),
  getTeamById: (id: number) => apiRequest(`/teams/${id}`),
  createJoinRequest: (teamId: number, data: any) => apiRequest(`/teams/${teamId}/join-request`, { method: "POST", body: JSON.stringify(data) }),
  getTeamJoinRequests: (teamId: number) => apiRequest(`/teams/${teamId}/join-requests`),
  reviewJoinRequest: (teamId: number, reqId: number, action: "approve" | "reject") => apiRequest(`/teams/${teamId}/join-requests/${reqId}/review`, { method: "POST", body: JSON.stringify({ action }) }),
  withdrawFromTeam: (teamId: number) => apiRequest(`/teams/${teamId}/withdraw`, { method: "POST" }),
  simulateWhatIf: (teamId: number, data: any) => apiRequest(`/teams/${teamId}/what-if-simulation`, { method: "POST", body: JSON.stringify(data) }),
  simulateGrowth: (teamId: number) => apiRequest(`/teams/${teamId}/growth-simulation`),
  getTeamHealth: (teamId: number) => apiRequest(`/teams/${teamId}/health`),

  // Buyers
  createBuyerRequirement: (data: any) => apiRequest("/buyers/requirements", { method: "POST", body: JSON.stringify(data) }),
  getMyBuyerRequirements: () => apiRequest("/buyers/requirements/my"),
  getActiveBuyerRequirements: (crop?: string) => apiRequest(`/buyers/requirements${crop ? `?crop=${crop}` : ''}`),
  getBuyerReliability: (buyerId: number) => apiRequest(`/buyers/${buyerId}/reliability`),

  // Negotiations
  createOffer: (data: any) => apiRequest("/negotiations/offer", { method: "POST", body: JSON.stringify(data) }),
  sendCounterOffer: (negId: number, data: any) => apiRequest(`/negotiations/${negId}/counter`, { method: "POST", body: JSON.stringify(data) }),
  voteOffer: (negId: number, vote: "approved" | "rejected") => apiRequest(`/negotiations/${negId}/vote`, { method: "POST", body: JSON.stringify({ vote }) }),
  acceptNegotiation: (negId: number) => apiRequest(`/negotiations/${negId}/accept`, { method: "POST" }),
  getTeamNegotiations: (teamId: number) => apiRequest(`/negotiations/team/${teamId}`),
  getMyBuyerNegotiations: () => apiRequest("/negotiations/buyer/my"),

  // Sales & Settlement
  checkoutSale: (negotiationId: number) => apiRequest("/sales/checkout", { method: "POST", body: JSON.stringify({ negotiation_id: negotiationId }) }),
  simulatePayment: (saleId: number, data: any) => apiRequest(`/sales/${saleId}/simulate-payment`, { method: "POST", body: JSON.stringify(data) }),
  getSaleDetail: (saleId: number) => apiRequest(`/sales/${saleId}`),
  getLotPassport: (lotCode: string) => apiRequest(`/sales/passport/${lotCode}`),
  getMySales: () => apiRequest("/sales/my/all"),

  // Wallet
  getMyWallet: () => apiRequest("/wallet/my"),
  withdrawWallet: (data: { amount: number; bank_account_or_upi: string }) => apiRequest("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest("/notifications"),
  getUnreadNotifCount: () => apiRequest("/notifications/unread-count"),
  markNotifRead: (id: number) => apiRequest(`/notifications/${id}/read`, { method: "POST" }),
  markAllNotifsRead: () => apiRequest("/notifications/read-all", { method: "POST" }),

  // Admin
  getAdminStats: () => apiRequest("/admin/stats"),
  getAdminUsers: (role?: string) => apiRequest(`/admin/users${role ? `?role=${role}` : ''}`),
  verifyUser: (userId: number, kycVerified: boolean) => apiRequest(`/admin/users/${userId}/verify`, { method: "POST", body: JSON.stringify({ kyc_verified: kycVerified }) }),
  getAdminTeams: () => apiRequest("/admin/teams"),
  getAdminConfig: () => apiRequest("/admin/config"),
  updateAdminConfig: (key: string, value: string) => apiRequest("/admin/config", { method: "POST", body: JSON.stringify({ key, value }) }),

  // AI Assistant
  askAIExplanation: (data: any) => apiRequest("/ai/explain", { method: "POST", body: JSON.stringify(data) }),
};
