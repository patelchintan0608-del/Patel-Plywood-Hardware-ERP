import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { api } from "../services/api";
import {
  getCurrentUser,
  getToken,
  login as authServiceLogin,
  logout as authServiceLogout,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Load latest live user profile from MongoDB on app initialization
  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem("erp_user", JSON.stringify(response.data.user));
          localStorage.setItem("erpAdmin", JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.warn("Session verification error or token expired:", error?.message);
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erpToken");
        localStorage.removeItem("erp_user");
        localStorage.removeItem("erpAdmin");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const res = await authServiceLogin(email, password, rememberMe);
    const currentUser = getCurrentUser() || res.user;
    if (currentUser) {
      setUser(currentUser);
    }
    return res;
  };

  const logout = () => {
    authServiceLogout();
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;

    const role = (user.role || "").toLowerCase();
    const permissions = user.permissions;

    if (!permission) return true;

    if (
      role.includes("admin") ||
      role.includes("administrator") ||
      user.email === "patelchintan0608@gmail.com" ||
      user.email === "admin@patelplywood.com" ||
      user.email === "chintan.patel@patelplywood.com" ||
      (Array.isArray(permissions) && permissions.includes("*"))
    ) {
      return true;
    }

    if (Array.isArray(permissions)) {
      const moduleKey = permission.split(".")[0];
      return permissions.includes(permission) || permissions.includes(moduleKey) || permissions.includes("*");
    } else if (permissions && typeof permissions === "object") {
      const moduleKey = permission.split(".")[0];
      return Boolean(
        permissions[permission] ||
        permissions[moduleKey] ||
        permissions["*"] ||
        (moduleKey === "salesOrders" && permissions.salesOrders) ||
        (moduleKey === "dispatch" && (permissions.dispatch || permissions.delivery)) ||
        (moduleKey === "delivery" && (permissions.delivery || permissions.dispatch)) ||
        (moduleKey === "payments" && (permissions.payments || permissions.accounts)) ||
        (moduleKey === "purchase" && (permissions.purchase || permissions.inventory))
      );
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
