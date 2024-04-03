import React, { useState, useEffect, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import apiurl from "../util";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState();
  const [tokenId, setToken] = useState();

  useEffect(() => {
    const cookies = document.cookie.split(";");
    let token = null;

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith("brandMonkeyAccessKey=")) {
        token = cookie.substring("brandMonkeyAccessKey=".length, cookie.length);
        break;
      }
    }

    if (token) {
      const decodedUserData = jwtDecode(token);
      const { id } = decodedUserData;

      setToken(token);

      apiurl
        .get(`/getUser`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json;  charset=UTF-8",
          },
          params: {
            userId: id,
          },
        })
        .then((response) => {
          const { employee } = response.data;
          localStorage.setItem("isAuthenticated", true);
          localStorage.setItem("isAdmin", employee?.type);
          setEmployeeData(employee);
        })
        .catch(function (error) {
          console.log(error);
        });

      const expirationTimestamp = decodedUserData.exp * 1000; // Convert to milliseconds
      const currentTimestamp = Date.now();

      if (currentTimestamp > expirationTimestamp) {
        document.cookie =
          "brandMonkeyAccessKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("isAdmin");
        setEmployeeData(null);
        navigate("/");
      }
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "brandMonkeyAccessKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isAdmin");
    setEmployeeData(null);

    navigate("/");
   
  };

  return (
    <AuthContext.Provider
      value={{ employeeData, setEmployeeData, tokenId, setToken, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
