import React, { useState } from "react";


import close from '../../assets/close.png'
import menu from '../../assets/menu.png'
import { Link } from "react-router-dom";
import { useAuth } from "../../context/loginContext";
import { profile } from "../../assets";
const Header = () => {
  const {employeeData, handleLogout} = useAuth();
  const [toggle, setToggle] = useState(false);
  const path = location.pathname;
  const closeMenu = () => {
    setToggle(false);
  };
  return (
    <>
       <span className="flex items-center justify-end  mt-4 mr-16  ">
        <div className="gradient rounded-3xl w-[300px] hidden md:block ">
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
              <img src={profile} alt=""  className="w-[6vh] h-[6vh] mt-2"/>
            )}
            </span>
            <span className="flex flex-col items-center mt-1 ">
            <p className="text-white">{employeeData?.name}</p>
            <span className="text-white font-extralight">
              ({employeeData?.designation})
            </span>
          </span>
          </span>
        </div>
      </span>

<div>
      <div className=' right-0  mt-5 z-50 md:hidden block'>
      <div className=" flex flex-1 justify-end items-center  ">
 <div className='glassm  w-16 h-16 me-9'>
          <img
            src={toggle ? close : menu}
            alt="menu"
            className="w-[27px] object-contain absolute ml-4 mt-5 cursor-pointer "
            onClick={() => setToggle(!toggle)}
          />
        </div>
          <div
        
          className={`${!toggle ? "hidden" : "flex"}
  p-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px]  rounded-xl sidebar z-50  glassu text-white mt-9 sm:mr-12 mr-6 aut`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${path === '/admin/dashboard' && "activem"}`} onClick={closeMenu}>
              <Link to="/admin/dashboard"> Home </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 ${(path === '/admin/myclient' || path.includes("/admin/client-detail/")) && "activem"}`} onClick={closeMenu}>
              <Link to="/admin/myclient"> All Clients </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px] z-50 mr-4 py-2 ${(path === '/admin/myemployee' || path.includes("/admin/employee-detail/") || path.includes("/admin/employee-sheet/"))  && "activem"}`} onClick={closeMenu}>
              <Link to={"/admin/myemployee"} className="z-50">My Employees </Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px] z-50 mr-4 py-2 ${path === '/admin/allserve' && "activem"}`} onClick={closeMenu}>
              <Link to={"/admin/allserve "} className="z-50">Back Pannel</Link>
            </li>
            <li className={`font-poppins font-medium cursor-pointer text-[16px]  mr-4 py-2 `}  onClick={() => {handleLogout(); closeMenu()}}>
              <Link to={"/login "} className="z-50">Logout</Link>
            </li>
          </ul></div>
          </div>
         
        </div> 
        </div>

    </>
  );
};

export default Header;
