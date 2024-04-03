import React, { useEffect, useState } from "react";
import ExchangeCard from "./ExchangeCard";
import { BrandIcon } from "../../Icon";
import Navbar from "../DashBordPage/Navbar";
import DeliverCard from "./ReviewList";
import Card from "./Card";
import { useParams } from "react-router-dom";
import apiurl from "../../util";
import Header from "../DashBordPage/Header";
import TicketDetails from "./Ticketdetail";

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState(null);
  const [click, setClick] = useState(false);
  const [ticket, setTicket] = useState([]);
  const getOneEmployee = async () => {
    try {
      const response = await apiurl.get(`/getOneEmployee/${id}`);
      setEmployeeData(response.data.employee);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const getTicketForEmployee = async () => {
    if (id) {
      try {
        let response = await apiurl.get(
          `/getOneClientOrEmployeeTickets?employeeId=${id}`
        );
        setTicket(response.data.tickets);
      } catch (error) {
        console.error("Error adding client:", error);
      }
    }
  };

  useEffect(() => {
    setClick(false);
    if (id) {
      getOneEmployee();
      getTicketForEmployee();
      
    }
  }, [id, click ]);


  console.log(ticket);

  return (
    <>
      <div className="w-full flex bg-[#f5cd15] font-poppins">
        <div className="bg-[#f5cd15] md:block hidden  h-screen">
          <div className="ml-4 mt-4 sm:mt-0">
            <BrandIcon />
          </div>
          <Navbar />
        </div>
        <div className="w-full bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen">
          <Header />
          <ExchangeCard employeeData={employeeData} />
          <p className="text-white mx-[6%] mt-8 font-poppins font-medium text-xl">
            Client Assigned
          </p>
          <div className="mx-[5%] overflow-x-scroll flex  bgCourse">
            {employeeData?.clients?.length > 0 ? (
              employeeData.clients.map((item, index) => (
                <Card key={index} item={item} id={id} setClick={setClick} />
              ))
            ) : (
              <span className="text-slate-300 mx-3">No clients assigned yet</span>
            )}
          </div>
          <div className=" md:mx-[5%]  ">
            <TicketDetails
              ticketData={ticket}
              id={id}
              getTicketForEmployee={getTicketForEmployee}
            />
          </div>
          <DeliverCard id={id} />
        </div>
      </div>
    </>
  );
};

export default EmployeeDetails;
