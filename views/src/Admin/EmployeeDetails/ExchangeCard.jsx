import React from "react";
import { Link } from "react-router-dom";
import { profile } from "../../assets/";



const ExchangeCard = ({ employeeData }) => {
  return (
    <>
       <p className="text-white font-poppins font-medium text-[20px]  md:mx-16 mx-6 relative mb-28  ">
        Employee Details :
      
      </p>
   
    <span className="flex flex-col items-center mt-16 ">
     

      <span className="border-gradient rounded-3xl  pt-7  w-[90%] ">
      <span className="flex justify-between items-center md:items-baseline sm:items-center  mx-6">
        <p className="text-white text-[18px] md:text-[30px] font-poppins px-3 md:px-0 font-medium md:pl-8 pb-5 pt-5 md:pt-0 ">
          {employeeData?.name}
        </p>
        <Link to={`/admin/employee-sheet/${employeeData?._id}`}>
            <button className=" z- 50  bg-black text-primary text-base px-4 py-1 rounded-md font-poppins BR cursor-pointer">
              View Sheet
            </button>
          </Link>
</span>
        <span className="relative ">
        {employeeData && employeeData?.imageUrl ? (
              <div className="">
                <img
                  src={employeeData?.imageUrl}
                  width={120}
                  height={120}
                  alt="img"
                  className="absolute bg-black md:top-[-11rem]  top-[-12rem] left-[50%] transform -translate-x-1/2 border-gradient rounded-full"
                />
              </div>
            ) : (
              <img src={profile} width={120} height={120} alt="img"   className="absolute bg-black md:top-[-9rem]  top-[-12rem] left-[50%] transform -translate-x-1/2 border-gradient rounded-full" />
            )}
          <span className="gradient rounded-br-3xl rounded-bl-3xl pt-1 flex md:justify-around items-center">
          
            <span className="w-[48%] font-light   text-[16px] py-5 mx-3 md:mx-0">
              <p className="text-white font-poppins  md:ml-[3rem]  ">
                <span className="font-semibold">Name</span> -{" "}
                {employeeData?.name}
              </p>
              
            
              <p className="text-white font-poppins  md:ml-[3rem]  mt-6">
                <span className="font-semibold">Phone</span> -{" "}
                {employeeData?.phoneNumber}
              </p>
              <p className="text-white font-poppins  md:ml-[3rem] mt-6">
                <span className="font-semibold">Email</span> -{" "}
                {employeeData?.email}
              </p>
              <p className="text-white font-poppins md:ml-[3rem] mt-6">
                <span className="font-semibold">Gender</span> -{" "}
                {employeeData?.Gender}
              </p>
            </span>
            <span className="w-[48%] mx-3 md:mx-0">
              <p className="text-white font-poppins font-light md:ml-[3rem] ">
                <span className="font-semibold">EID</span> -{" "}
                {employeeData?.employeeId}
              </p>
              <p className="text-white font-poppins font-light  md:ml-[3rem] mt-6">
                <span className="font-semibold">Designation</span> -{" "}
                {employeeData?.designation}
              </p>
              <p className="text-white font-poppins font-light md:ml-[3rem] mt-6">
                <span className="font-semibold">Team</span> -{" "}
                {employeeData?.team}
              </p>
              <p className="text-white font-poppins font-light md:ml-[3rem] mt-6">
                <span className="font-semibold">DOJ</span> -{" "}
                {employeeData?.DateOfJoining}
              </p>
            </span>
          </span>
         
        </span>
      </span>
    </span>
    </>
  );
};

export default ExchangeCard;
