import React, { useState } from "react";

import close from "../../assets/close.png";
import menu from "../../assets/menu.png"
import { Link } from "react-router-dom";
import { useAuth } from "../../context/loginContext";

const Header = () => {
  const {employeeData, handleLogout} = useAuth();

  const [toggle, setToggle] = useState(false);
  const path = location.pathname;
  const closeMenu = () => {
    setToggle(false);
  };
  return (
    <>
      <span className="flex items-center justify-end  mt-4 mr-16 ">
        <span className="gradient rounded-3xl w-[300px] md:block hidden">
      <span className="flex  px-2 gap-5 ">
            <span className=" ">
            {employeeData && employeeData?.imageUrl ? (
              <div className="">
                <img
                  src={employeeData?.imageUrl}
               
                  alt=""
                  className="w-[6vh] h-[6vh] mt-2 rounded-full"
                />
              </div>
            ) : (
              <img src="./Profile.png" alt=""  className="w-[6vh] h-[6vh] mt-2"/>
            )}
            </span>
            <span className="flex flex-col items-center mt-1 ">
            <p className="text-white">{employeeData?.name}</p>
            <span className="text-white font-extralight">
              ({employeeData?.designation})
            </span>
          </span>
          </span>
        </span>
      </span>



      <div className=' right-0  mt-5 z-50 md:hidden block'>
      <div className=" flex flex-1 justify-end items-center  ">
 <div className='glassm  w-16 h-16 me-3'>
          <img
            src={toggle ? close : menu}
            alt="menu"
            className="w-[27px] object-contain absolute ml-4 mt-5 cursor-pointer "
            onClick={() => setToggle(!toggle)}
          />
        </div>
          <div
        
        className={`${!toggle ? "hidden" : "flex"}
  p-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar z-50 glassu text-white mt-9 sm:mr-12 mr-6 aut`}>
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/home' && "activem"}`} onClick={closeMenu}>
              <Link to="/home"> Home </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/clients' && "activem"}`} onClick={closeMenu}>
              <Link to="/clients"> MY Clients </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/raised-complaint' && "activem"}`} onClick={closeMenu}>
              <Link to={"/raised-complaint"}>Raised Complaints </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/resolved' && "activem"}`} onClick={closeMenu}>
              <Link to={"/resolved "}>Resolved Complaint</Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/updatetask' && "activem"}`} onClick={closeMenu}>
              <Link to={"/updatetask"}> Task Updated </Link>
            </li>
            <li onclick={handleLogout} className="font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2" onClick={closeMenu}>
              <Link to={"/"}> Logout </Link>
            </li>
          </ul>
          </div>
        </div>
        </div>

    </>
  );
};

export default Header;
