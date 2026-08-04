export const saveAuth = ({ tokens, admin, school }) => {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("admin", JSON.stringify(admin));
  localStorage.setItem("school", JSON.stringify(school));
};

export const getAdmin = () => {
  const admin = localStorage.getItem("admin");
  return admin ? JSON.parse(admin) : null;
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("admin");
  localStorage.removeItem("school");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const setAccessToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const setRefreshToken = (token) => {
  localStorage.setItem("refreshToken", token);
};

export const getSchool = () => {
  const school = localStorage.getItem("school");
  return school ? JSON.parse(school) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};
