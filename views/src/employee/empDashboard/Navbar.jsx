import React, { useState } from "react";
import {
  IoIosArrowDropright,
  IoMdPeople,
  IoMdCheckmarkCircle,
} from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaAddressCard } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";

import { IoBackspaceOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/loginContext";
import { BiSolidExit } from "react-icons/bi";


const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const {employeeData, handleLogout} = useAuth();
  const path = location.pathname;
  const clickhandler = () => {
    setShowNavbar(false);
  };

  return (
    <>
    <span className="">
      {showNavbar && (
        <span className="flex flex-col items-start justify-center mt-[5rem] w-full font-poppins ml-4 ">
          <span className="flex flex-col mt-[-6rem] justify-center items-center">
            <span className="text-2xl ml-[10rem] cursor-pointer p-4">
              <IoBackspaceOutline onClick={clickhandler} />
            </span>
            {employeeData && employeeData?.imageUrl ? (
              <div className="">
                <img
                  src={employeeData?.imageUrl}
                  width={60}
                  height={60}
                  alt=""
                  className="bg-white rounded-full cover-fill "
                />
              </div>
            ) : (
              <img src="./Profile.png" width={60} height={60} alt="" />
            )}
            <p className="font-poppins font-medium mt-0">
            {employeeData?.name}{" "}
              <span className="flex justify-center items-center font-normal">
              ({employeeData?.designation})
              </span>
            </p>
          </span>

          <Link to="/home">
            <span className={ `ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/home' && "activedash employee-side"}`}>
              <MdDashboard size={26}  />
              <p className="z-50">Dashbord</p>
            </span>
          </Link>
          <Link to="/clients" >
            <span className={`ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/clients' && "activeclient employee-side"}`}>
              <FaAddressCard size={26}  />
              <p className="z-50">My Client</p>
            </span>
          </Link>
          <Link to="/raised-complaint">
            <span className={`ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/raised-complaint' && "activeraised employee-side"}`}>
              <IoMdPeople size={26}  />
              <p className="z-50">Raised Complaint</p>
            </span>
          </Link>
          <Link to="/resolved">
            <span className={`ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/resolved' && "activeresolve employee-side"}`}>
              <IoMdCheckmarkCircle size={26}  />
              <p className="z-50">Resolved Complaint</p>
            </span>
          </Link>
          <Link to="/updatetask">
            <span className={`ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/updatetask' && "activetask employee-side"}`}>
            <BiSolidExit  size={27}/>
              <p className="z-50">Task Updated</p>
            </span>
          </Link>
          <Link onClick={handleLogout} to="/" className="ml-2.5 flex items-center gap-3 font-normal mt-6">
            <RiLogoutCircleRLine size={26}  />
            <p>Logout</p>
          </Link>
        </span>
      )}
      {!showNavbar && (

        <span className=" flex flex-col items-start justify-center   gap-6   bg-black  w-[39%] mt-8 pt-9 pb-9   rounded-r-full ">
          <span className="ml-3">
            <IoIosArrowDropright
              onClick={() => setShowNavbar(true)}
              className="text-white text-2xl sm:text-xl cursor-pointer" size={26}
            />
          </span>
          <Link to="/home">
          <span className="ml-3 mt-7 cursor-pointer">
            <MdDashboard className="text-white text-2xl" />
          </span></Link>
          <Link to="/clients">
          <span className="ml-3 mt-7 cursor-pointer">
            <FaAddressCard className="text-white text-2xl" />
          </span></Link>
          <Link to="/raised-complaint">
          <span className="ml-3 mt-7 cursor-pointer">
            <IoMdPeople className="text-white text-2xl" />
          </span></Link>
          <Link to="/resolved">
          <span className="ml-3 mt-7 cursor-pointer">
            <IoMdCheckmarkCircle className="text-white text-2xl" />
          </span></Link>
          <Link to="/updatetask">
          <span className="ml-3 mt-7 cursor-pointer text-white">
          <BiSolidExit  size={27}/> 
          </span></Link>
          
          <span className="ml-3 cursor-pointer " onClick={handleLogout}>
            <RiLogoutCircleRLine className="text-white text-2xl" />
          </span>
        </span>
       
      )}
      </span>
    </>
  );
};

export default Navbar;
