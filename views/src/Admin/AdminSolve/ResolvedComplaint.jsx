import React, { useEffect, useState } from "react";
import Card from "./Card";
import { BrandIcon } from "../../Icon";
import Navbar from "../DashBordPage/Navbar";
import { FaChevronDown } from "react-icons/fa";
import { useEmployee } from "../../context/employeeContext";
import apiurl from "../../util";
import Header from "../DashBordPage/Header";

const ResolvedComplaint = () => {
  const { getAllResolvedRequest, resolvedTickets } = useEmployee();
  const [clicked, setClicked] = useState(false);
  const ticketResolveOrRevert = async (id, value) => {
    setClicked(true);
    try {
      await apiurl.post(`/acknowledgeTicket?id=${id}&value=${value}`);

      setClicked(false);
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };
  useEffect(() => {
    getAllResolvedRequest();
  }, [clicked]);
  return (
    <>
      <span className="w-full   flex flex-col sm:flex-row bg-primary font-poppins">
        <span className="bg-primary md:block hidden  h-screen">
          <span className="ml-4 mt-4 sm:mt-0">
            <BrandIcon />
          </span>
          <span className="mt-[-3rem]">
            <Navbar />
          </span>
        </span>
        <span className="w-full bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden  h-screen">
        <Header/>
          <span className=" mt-[4rem] flex flex-col gap-6 mx-6 md:mx-20 ">
            {resolvedTickets?.length > 0 ? (
              <>
                {resolvedTickets?.map((item, index) => (
                  <Card
                    key={index}
                    item={item}
                    ticketResolveOrRevert={ticketResolveOrRevert}
                  />
                ))}
              </>
            ) : (
              <span className="text-center text-white">No Tickes Resolved or Issued</span>
            )}
          </span>
          
        </span>
      </span>
    </>
  );
};

export default ResolvedComplaint;
