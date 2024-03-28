import React, { useState } from "react";
import {
  IoIosArrowDropright,
  IoMdPeople,
  IoMdCheckmarkCircle,
} from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaAddressCard } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { BiSolidExit } from "react-icons/bi";
import { IoBackspaceOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/loginContext";
import { profile } from "../../assets";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const path = location.pathname;
  const navigate = useNavigate();
  const {employeeData, handleLogout} = useAuth();
 
  const clickhandler = () => {
    setShowNavbar(false);
  };

  
  
console.log(employeeData);
  return (
    <>
      {showNavbar && (
        <div className={`hidden md:block items-start justify-center mt-[5rem] w-full font-poppins ml-4 max-h-[100vh] navbar-container  `}>
          <span className="flex flex-col mt-[-6rem] justify-center items-center">
            <span className="text-2xl ml-[10rem] cursor-pointer p-4 ">
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
              <img src={profile} alt="img"  className="w-[6vh] h-[6vh] mt-2"/>
            )}
            <p className="font-poppins font-medium mt-0">
              {employeeData?.name}{" "}
              <span className="flex justify-center items-center font-normal">
                ({employeeData?.designation})
              </span>
            </p>
          </span>

          <Link to="/admin/dashboard">
         
            <span className={`ml-3 flex items-center gap-3 font-normal mt-6 ${path === '/admin/dashboard'   && "active activenav"}`}>
            
              <MdDashboard size={26} /> 
              <p className="z-50">Dashbord</p>
              {/* <span className="active"></span> */}
            </span>
          
          </Link>
          <Link to="/admin/myclient" className="">
            <span className={`ml-3 flex items-center gap-3 font-normal z-50 mt-6 ${(path === '/admin/myclient' || path.includes("/admin/client-detail/")) && "activeaclient activenav"}`}>
              <FaAddressCard
                size={26}
                className=" text-3xl sm:text-lg"
              />
              <p className="z-50">My Client</p>
            </span>
          </Link>
          <Link to="/admin/myemployee">
            <span className={ `ml-3 z-50 flex items-center gap-3 font-normal mt-6 ${(path === '/admin/myemployee' || path.includes("/admin/employee-detail/") || path.includes("/admin/employee-sheet/"))  && "activeemp activenav"}`}>
              <IoMdPeople
                size={26}
                className=" text-3xl sm:text-lg"
              />
              <p className="z-50">My Employee</p>
            </span>
          </Link>
          <Link to="/admin/resolved-complaint">
            <span className={`ml-3 z-50 flex items-center gap-3 font-normal  mt-6 ${path === '/admin/resolved-complaint' && "activeres activenav"}`}>
              <IoMdCheckmarkCircle
                size={26}
                className=" text-3xl sm:text-xl"
              />
              <p className="z-50">Resolved Complaint</p>
            </span>
          </Link>
          <Link to="/admin/allserve">
            <span className="ml-3 z-50 flex items-center gap-3 font-normal mt-6">
            <BiSolidExit  size={27}/>
              <p className="z-50">Back Panel</p>
            </span>
          </Link>
          <span onClick={handleLogout} className="ml-2.5 flex items-center gap-3 font-normal mt-6 cursor-pointer">
            <RiLogoutCircleRLine
              size={26}
              className="text-black text-3xl sm:text-xl"
            />
            <p className="z-50">Logout</p>
          </span>
        </div>
      )}
      {!showNavbar && (
        <span className=" flex items-start justify-center gap-6  flex-col bg-black w-[38%] mt-8 pt-9 pb-9 rounded-r-full navbar-container">

          <span className="ml-3">
            <IoIosArrowDropright
              onClick={() => setShowNavbar(true)}
              className="text-white text-2xl sm:text-xl cursor-pointer"
              size={26}
            />
          </span>
          
          <Link to="/admin/dashboard">
          <span className="ml-3 mt-7">
            <MdDashboard className="text-white text-2xl" />
          </span></Link>
          
          <Link to="/admin/myclient">
          <span className="ml-3 mt-7">
            <FaAddressCard className="text-white text-2xl" />
          </span></Link>
          
          <Link to="/admin/myemployee">
          <span className="ml-3 mt-7">
            <IoMdPeople className="text-white text-2xl" />
          </span></Link>
          
          <Link to="/admin/resolved-complaint">
          <span className="ml-3 mt-7">
            <IoMdCheckmarkCircle className="text-white text-2xl" />
          </span></Link>
          
          <Link to="/admin/allserve">
          <span className="ml-3 text-white ">
          <BiSolidExit  size={27}/>
          </span></Link>
          
          
         
          <span onClick={handleLogout} className="ml-3 ">
            <RiLogoutCircleRLine className="text-white text-2xl" />
          </span>
        </span>
      )}


     
    </>
  );
};

export default Navbar;
