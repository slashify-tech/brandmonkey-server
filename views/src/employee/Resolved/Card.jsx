import React, { useEffect, useState } from "react";
import { useEmployee } from "../../context/employeeContext";
import { useAuth } from "../../context/loginContext";



const Card = () => {
  const { employeeData } = useAuth();
  const { getAllResolvedRequest, resolvedTickets } = useEmployee();

  useEffect(() => {
    if (employeeData && employeeData?._id) {
      getAllResolvedRequest(employeeData?._id);
    }
  }, [employeeData?._id]);
  return (
    <>
      {resolvedTickets?.length > 0 ? (
        <>
          {resolvedTickets?.map((item, index) => 
            <span
              key={index}
              className="gradient-color rounded-2xl w-full bg-white  font-poppins "
            >
              <p className=" text-white font-light   m-1 p-3 md:pr-[20rem] sm:pr-0 ">
                you have solved the issue of {item?.forClients?.name} on :{" "}
                {item?.description} {". . . . . . . . .yet to be accepted"}
              </p>
            </span>
          )}
        </>
      ) : (
        <span className="text-white">No Tickets Resolved.. </span>
      )}
    </>
  );
};

export default Card;
