import React, { useState } from "react";
import topl from "./assets/topl.png";
import middel from "./assets/middel.png";
import bottoml from "./assets/bottoml.png";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

import { useNavigate } from "react-router-dom";

import apiurl from "./util";
import { useAuth } from "./context/loginContext";
import { toast } from "react-toastify";

const Login = () => {
  const { setEmployeeData, setToken } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLoginData = (e) => {
    const { value, name } = e.target;
    setLoginData((log) => ({
      ...log,
      [name]: value,
    }));
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const accessToken = credentialResponse.access_token;

    try {
      // signin user
      const response = await apiurl.post(`/signin`, {
        googleAccessToken: accessToken,
      });
      const { employee, token } = response.data;
      setEmployeeData(employee);
      setToken(token);
      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem("isAdmin", employee.type);

      document.cookie = `brandMonkeyAccessKey=` +token;
      if (employee.type === "superadmin" ) {
        navigate("/admin/dashboard");
        window.location.reload();
      }
      else if (employee.type === "employee") {
        navigate("/home");
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const login = useGoogleLogin({ onSuccess: handleGoogleLoginSuccess });
  const handleLogin = async () => {
    const { email, password } = loginData;
    try {
      // signin employee
      const response = await apiurl.post(`/signin`, { email, password });
      const { employee, token } = response.data;
      setEmployeeData(employee);
      setToken(token);
      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem("isAdmin", employee.type);
      document.cookie = `brandMonkeyAccessKey=` +token;
      if (employee.type === "superadmin" ) {
      
        navigate("/admin/dashboard");
        window.location.reload();
       
      }
      else if (employee.type === "employee") {
       
        navigate("/home");
        window.location.reload();
      }
     

     
    } catch (err) {
      toast.error("invalid credentials");
    }
  };
  const handleKeyDown = (e) => {
    
    if (e.key === "Enter") {
      handleLogin();
      
    }
    console.log(e.key);
  };
  
  return (
    <>
      <div className="bg-black w-full h-screen  overflow-hidden">

        <img
          src={middel}
          alt="img"
          className="w-[55%] translate-x-[38%] translate-y-[20%] absolute  md:block hidden  "
        />

        <img
          src={topl}
          alt="img"
          className="w-[56%]  translate-x-[75%] translate-y-[1%] skew-y-6 -rotate-3 absolute  md:block hidden "
        />
        <img src={bottoml} alt="img" className="w-[58%] mt-52 ml-12   md:block hidden " />
      </div>

      <span className="gradient absolute   md:top-32 md:left-[30rem] top-36 left-6 sm:left-44 sm:top-48 lg:left-[30rem] lg:top-32 xl:left-[40rem] xl:top-52 px-9 py-9 rounded-3xl border-gradient  ">
        <span className="flex flex-col justify-center items-center  text-white font-poppins">
          <span className="flex flex-col">
            <label className="pb-3">Email</label>
            <input
              type="text"
              name="email"
              value={loginData.email}
              onChange={(e) => handleLoginData(e)}
              placeholder="Email "
              className="text-black px-2 md:w-[50vh] w-[30vh] h-11 rounded-md bg-[#949494] "
            />
          </span>
          <span className="flex flex-col mt-8">
            <label className="pb-3">Password</label>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={loginData.password}
              onChange={(e) => {handleLoginData(e); handleKeyDown(e)}}
              className="text-black px-2 md:w-[50vh] w-[30vh] h-11 bg-[#949494] rounded-md "
            />
          </span>
          <span
            className="md:px-[155px] px-[13vh] xl:px-52 bg-black rounded-md py-2 text-primary mt-8 hover:bg-primary hover:text-black cursor-pointer border-gradient"
            onClick={() =>{ handleLogin() }}
          >
            Log in
          </span>

          <span
            onClick={login}
            className="md:px-[78px] px-5 xl:px-32 bg-white rounded-md py-1 text-black font-medium mt-7 mb-5 cursor-pointer inline-flex items-center justify-center gap-3 "
          >
            <FcGoogle size={33} />
            Sign in with Google
          </span>
        </span>
      </span>
    </>
  );
};

export default Login;
