import React, { useState } from "react";
import { IoIosArrowDropright, IoMdPeople } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { FaAddressCard, FaToolbox } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";

import { IoBackspaceOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

import { IoIosPeople } from "react-icons/io";
import { BiSolidShoppingBags } from "react-icons/bi";
import { RiHome5Line } from "react-icons/ri";
import { useAuth } from "../../../context/loginContext";
import { profile } from "../../../assets";


const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const {employeeData, handleLogout} = useAuth();
  const navigate = useNavigate();
  const path = location.pathname;
  const clickhandler = () => {
    setShowNavbar(false);
  };

  return (
    <>
      {showNavbar && (
        <span className="flex flex-col items-start justify-center  w-full font-poppins ml-4 ">
          <span className="flex flex-col  justify-center items-center">
            <span className="text-2xl ml-[10rem] cursor-pointer p-4">
              <IoBackspaceOutline onClick={clickhandler} />
            </span>
            {employeeData && employeeData?.imageUrl ? (
              <div className="">
                <img
                  src={employeeData?.imageUrl}
               
                  alt=""
                  className="w-[10vh] h-[10vh] mt-2 rounded-full"
                />
              </div>
            ) : (
              <img src={profile} alt=""  className="w-[6vh] h-[6vh] mt-2"/>
            )}
            <p className="font-poppins font-medium mt-0">
              {employeeData?.name}{" "}
              <span className="flex justify-center items-center font-normal">
                ({employeeData?.designation})
              </span>
            </p>
          </span>
          <span className="ml-5">
            <Link to="/admin/dashboard">
              <span className={`ml-3 flex items-center gap-3 font-normal z-50  pt-7`} >
              <RiHome5Line size={27} />
                <p className="font-poppins font-normal z-50 ">Home</p>
              </span>
            </Link>
            <Link to="/admin/allserve" className="">
              <span className={ `ml-3 flex items-center gap-3 font-normal pt-9  z-50  ${path === '/admin/allserve'  && "activeservice activeback"}`}>
              <BiSolidShoppingBags size={27} />
                <p className="font-poppins font-normal z-50 ">All Services </p>
              </span>
            </Link>
            <Link to="/admin/allclients">
              <span className={`ml-3 flex items-center gap-3 font-normal pt-9 z-50 ${(path === '/admin/allclients' || path.includes("/admin/addclient") || path.includes("/admin/edit-client-form/")) && "activeallcli activeback"}`}>
                <FaAddressCard size={24} />
                <p className="font-poppins font-normal mt-[-1] z-50">All Client</p>
              </span>
            </Link>
            <Link to="/admin/allemployee">
              <span className={`ml-3 flex items-center gap-3 font-normal pt-9 z-50 ${(path === '/admin/allemployee' || path.includes("/admin/addemployee") || path.includes("/admin/edit-employee-form/")) && "activeallemp activeback"}`}>
              <IoIosPeople size={27}/>
                <p className="font-poppins font-normal mt-[-1] z-50">All Employee</p>
              </span>
            </Link>
            <span onClick={handleLogout} className="ml-2.5 flex items-center gap-3 font-normal pt-9 cursor-pointer">
              <RiLogoutCircleRLine size={26} />
              <p>Logout</p>
            </span>
          </span>
        </span>
      )}
      {!showNavbar && (
        <span className="flex flex-col items-start justify-center mt-[5rem] gap-8 bg-black w-[35%]  pt-8 pb-8 rounded-r-full">
   
          <span className="ml-3 cursor-pointer">
            <IoIosArrowDropright
              onClick={() => setShowNavbar(true)}
              className="text-white text-2xl sm:text-2xl "
            />
          </span>
          <Link to="/admin/dashboard">
          <span className="ml-3 cursor-pointer text-white">
            <MdHome className="text-white text-2xl" />
          </span></Link>
          <Link to="/admin/allserve">
          <span className="ml-3 cursor-pointer">
            <FaToolbox className="text-white text-xl" />
          </span></Link>
          <Link to="/admin/allclients">
          <span className="ml-3 cursor-pointer">
            <FaAddressCard className="text-white text-xl" />
          </span></Link>
          <Link to="/admin/allemployee">
          <span className="ml-3 cursor-pointer">
            <IoMdPeople className="text-white text-2xl" />
          </span></Link>

          <span onClick={handleLogout} className="ml-3 cursor-pointer">
            <RiLogoutCircleRLine className="text-white text-2xl" />
          </span>
        </span>
      )}
    </>
  );
};

export default Navbar;
