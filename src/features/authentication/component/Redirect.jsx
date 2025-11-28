import { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Login from "../../../pages/Login";
import AuthContext from "../context/AuthContext";

const Redirect = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo =
        user.access_level === "admin"
          ? "/workspace/requests-management"
          : "/portal/dashboard";

      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return isAuthenticated ? null : <Login />;
};

export default Redirect;