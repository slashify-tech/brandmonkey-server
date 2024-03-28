import React, { useEffect, useState } from "react";
import Card from "./Card";
import { BrandIcon, Notification, Setting } from "../../Icon";
import Navbar from "../empDashboard/Navbar";

import apiurl from "../../util";
import Header from "../empDashboard/Header";
import { useAuth } from "../../context/loginContext";


const RaisedComplained = () => {
  const { employeeData } = useAuth();
  const [employeeTicket, setEmployeeTicket] = useState([]);
  const [click, setClick] = useState(false);
  const getRaisedIssue = async () => {
    if (employeeData && employeeData?._id) {
      try {
        const response = await apiurl.get(
          `/getEmployeeTickets/${employeeData?._id}`
        );
        setEmployeeTicket(response.data.tickets);
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    getRaisedIssue();
  }, [click, employeeData?._id]);

  return (
    <>
      <span className=" flex bg-primary font-poppins">
        <span className="child md:block hidden">
          <span className="ml-3">
            <BrandIcon />
          </span>
          <Navbar />
        </span>
        <span className="bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] md:w-[95%] w-full h-screen overflow-scroll scrollbar-hide">
        <Header/>
          <span className="flex justify-center items-center">
            <span className="grid grid-cols-1 mt-[4rem] gap-4 mx-6 md:mx-0 sm:mx-6" id="card-grid">
              {employeeTicket?.length > 0 ? (
                <>
                  {employeeTicket?.map((item, index) => (
                    <Card key={index} item={item} setClick={setClick} />
                  ))}
                </>
              ) : (
                <span className="text-white">No Tickets Issued</span>
              )}
            </span>
          </span>
         
        </span>
      </span>
    </>
  );
};

export default RaisedComplained;
