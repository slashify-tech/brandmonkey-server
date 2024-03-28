import React from "react";
import error from "./assets/Error.png"
import monkey from "./assets/monkey.png"
import { Link } from "react-router-dom";
const ErrorPage = () => {
  return (
    <div className="bg-[#121212] font-poppins h-[100vh]">
    <span className="  flex justify-center items-center  ">
        <img src={monkey} alt="error" className="w-[65vh] h-[65vh] mt-12" />

      <img
        src={error}
        alt=""
        className="absolute "
      
      />
      </span>
    <span className=" flex flex-col justify-center items-center   ">
      <p className="text-[35px] text-white ">
         Oops! We couldn’t find that page.
      </p>
      <p className="text-lg  text-white ">
      May be you find what you need here?
      </p>
      <Link to="/" className="bg-primary py-2 px-3 rounded-2xl text-black mt-6 font-medium ">
          Back to Home page
      </Link>
     </span>
     </div>
  );
};

export default ErrorPage;
