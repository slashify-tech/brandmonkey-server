import React, { useEffect, useMemo } from "react";
import { BrandIcon } from "../../Icon";
import Navbar from "./Navbar";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import Header from "./Header";
import { useAuth } from "../../context/loginContext";
import { useEmployee } from "../../context/employeeContext";



const EmployeeHome = () => {
  const { employeeData } = useAuth();
  const { getEmployeeDashBoard, dashboardEmployeeData } = useEmployee();

  useEffect(() => {
    if (employeeData?._id) {
      getEmployeeDashBoard(employeeData?._id);
    }
  }, [employeeData?._id]);

  const totalWorkProgress = useMemo(() => parseInt(dashboardEmployeeData?.totalWorkProgress), [dashboardEmployeeData?.totalWorkProgress]);
  const totalTicketsResolved = useMemo(() => parseInt(dashboardEmployeeData?.totalTicketsResolved), [dashboardEmployeeData?.totalTicketsResolved]);
  const totalTickets = useMemo(() => dashboardEmployeeData?.totalTickets, [dashboardEmployeeData?.totalTickets]);

  console.log(dashboardEmployeeData);
  
  return (
    <>
      <div className="w-full h-full flex bg-primary font-poppins  ">
        {/* Sidebar */}
        <div className="bg-primary md:block hidden  h-screen">
          <div className="ml-4 mt-4">
            <BrandIcon />
          </div>
          <div>
            <Navbar />
          </div>
        </div>
        {/* Main Content */}
        <div className="bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen px-5 md:px-0 sm:w-full w-full scrollbar-hide">
          <Header />
          <Card dashboardEmployeeData={dashboardEmployeeData} />
          <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1  md:mx-12 sm:mx-20 sm:gap-5 flex-col mx-6 md:items-center mb-9 mt-2 rg:mx-28 ">
            <ProgressBar
              total={100}
              valueCompleted={totalWorkProgress}
              valuePending={100 - totalWorkProgress}
              work={true}
            />
            <ProgressBar
              total={totalTickets}
              valueCompleted={totalTicketsResolved}
              valuePending={totalTickets - totalTicketsResolved}
              work={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeHome;
