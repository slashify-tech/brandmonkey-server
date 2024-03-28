import React, { useEffect, useState } from "react";
import { BrandIcon } from "../../Icon";
import Navbar from "./Navbar";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import Header from "./Header";
import { useEmployee } from "../../context/employeeContext";
import { useAuth } from "../../context/loginContext";


const AdminHome = () => {

  const { adminData } = useAuth();
  const { getAdminDashBoard, dashboardAdminData } = useEmployee();

  useEffect(() => {
    if (adminData?._id) {
      getAdminDashBoard(adminData?._id);
    }
  }, [adminData, adminData?._id]);

  
  return (
    <>
      <span className="w-full  h-full  flex   bg-primary font-poppins ">
        {/* Sidebar */}
        <span className=" bg-primary md:block hidden">
          <span className="ml-4  mt-4 ">
            <BrandIcon />
          </span>
          <span>
            <Navbar />
          </span>
        </span>
        {/* Main Content */}
        <span className="   bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] sm:w-full h-screen overflow-x-hidden">
          <Header />

          <Card dashboardAdminData={dashboardAdminData}  />

          <span className="  grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  md:mx-12 sm:mx-20 sm:gap-5 flex-col mx-6 md:items-center mb-9 mt-2 rg:mx-28 ">
            <ProgressBar
              title="Total Ticket Raised"
              total={dashboardAdminData?.TotalTickets}
              valueCompleted={dashboardAdminData?.TotalTicketSolved}
              valuePending={
                dashboardAdminData?.TotalTickets -
                dashboardAdminData?.TotalTicketSolved
              }
              work={false}
              totalCount ={dashboardAdminData?.TotalTickets}
            />

            <ProgressBar
              title="Employee Review"
              total={dashboardAdminData?.totalGoodReviewsCount}
              valueCompleted={
                dashboardAdminData?.totalGoodReviewsCount +
                dashboardAdminData?.totalBadReviewsCount
              }
              valuePending={dashboardAdminData?.totalBadReviewsCount}
              work={true}
              totalCount ={  dashboardAdminData?.totalGoodReviewsCount +
                dashboardAdminData?.totalBadReviewsCount}
            />
          </span>
        </span>
      </span>
    </>
  );
};

export default React.memo(AdminHome);
