import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";

import apiurl from "../../util";
import { useEmployee } from "../../context/employeeContext";
const EmployeeClientViewPage = ({
  item,
  employeeId,
  onClose,
  selectedEmployee,
}) => {
  const { setAllEmployees, allEmployees } = useEmployee();
  const deleteClientAllot = async (id) => {
    if (id) {
      try {
        await apiurl.delete(`deleteClientAllot/${employeeId}?clientId=${id}`);

        const updatedEmployees = allEmployees.map((employee) => {
          if (employee._id === employeeId) {
            const updatedClients = employee.clients.filter(
              (client) => client._id !== id
            );
            return { ...employee, clients: updatedClients };
          }
          return employee;
        });

        setAllEmployees(updatedEmployees);
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {}, []);
  return (
    <div className={`fixed inset-0 flex justify-center z-50 shadow  mt-5 `}>
      <div className="bg-[#f5f3f3] p-4 mx-3 md:mt-0 mt-20 md:p-7 rounded-lg   md:w-[55%] w-full relative shadow overflow-y-scroll scrollbar-hide">
        <Link
          to={`/admin/allemployee`}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <IoClose size={30} color="black" />
        </Link>

        <div>
          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              Clients Assigned
            </h1>
          </div>

          <div className=" md:w-[95%] sm:w-[90%] flex flex-row items-center justify-around font-semibold mt-6 ">
            <span className="text-center px-5">Clients Name</span>
            <span className="text-center  ">Progess</span>
            <span className="text-center">Add Reviews</span>
            <span className="text-center px-3">Delete</span>
          </div>
          {item?.map((items, index) => (
            <div
              key={index}
              className="flex flex-row items-center justify-around md:w-[90%] sm:w-[85%]"
            >
              <span className=" w-[28%]">
                {items.clientName.split("-")[0] + "(" + items.clientType + ")"}
              </span>
              <span className="text-start  ">
                {items.progressValue.split("-")[1]}%
              </span>
              <Link
                to={`/reviewform/${employeeId}`}
                className="md:w-[20%]   bg-[#000000] text-center py-2 overflow-hidden rounded-lg px-2  text-[#F5CD15] cursor-pointer  mt-3 "
              >
                + Add Review
              </Link>

              <span
                onClick={() => deleteClientAllot(items._id)}
                className="cursor-pointer"
              >
                <RiDeleteBin6Line color="maroon" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeClientViewPage;
