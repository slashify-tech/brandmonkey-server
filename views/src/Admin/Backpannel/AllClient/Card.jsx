import React from "react";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

import apiurl from "../../../util";
import setupInterceptors from "../../../Interceptors";

import { Link } from "react-router-dom";
import { PiSwapLight } from "react-icons/pi";
import { useEmployee } from "../../../context/employeeContext";
import { useAuth } from "../../../context/loginContext";
const filterClientServices = (client) => {
  const excludedKeys = [
    "_id",
    "name",
    "clientType",
    "__v",
    "ticketsCount",
    "GST",
    "State",
    "Country",
    "Address",
    "clientLogo",
    "colorZone",
    "logo",
  ];

  const filteredKeysAndServices = [];

  for (const key in client) {
    if (!excludedKeys.includes(key) && client[key] !== "NA") {
      filteredKeysAndServices.push({ key, value: client[key] });
    }
  }

  return filteredKeysAndServices;
};
const Card = ({ item, setClient }) => {
  const filteredServices = filterClientServices(item);
  const { tokenId } = useAuth();
  const { ticketRaiseDataWithClientsForAdmin } = useEmployee();
  const deleteClient = async (id) => {
    if (tokenId) {
      setClient(true);
      setupInterceptors(tokenId);
      try {
        const response = await apiurl.delete(`/deleteClient/${id}`);
        setClient(false);
        toast.success("Successfully deleted");
      } catch (err) {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <span className="border-gradient rounded-3xl  md:mx-0 sm:mx-6 mx-6 flex flex-col sm:mt-9 md:mt-0 font-poppins  ">
      <span className="text-white mx-5  flex justify-between items-center mt-3 ">
        <span className="flex">
        {item  && item ?.clientLogo ? (
              <div className="">
                <img
                  src={item ?.clientLogo}
                  width={40}
            height={40}
            alt="img"
            className=" rounded-3xl m-3 mt-2 ml-1.5 "
                />
              </div>
            ) : (
              <img src="./Profile.png"  width={40}
            height={40} alt="img"
            className=" rounded-3xl m-3 mt-2 ml-1.5 "/>
) }
          <p className=" font-poppins text-md mt-3">{item.name}</p>
        </span>
        <span >
          <span className="bg-primary rounded-lg px-3 py-1 text-[12px] text-black cursor-pointer">
            {item.clientType}
          </span>
        </span>
      </span>

      <div className="w-full h-full gradient rounded-br-3xl rounded-bl-3xl mt-5  flex flex-col justify-between">
      <span className="w-full ">
        <span className="flex justify-start">
          <span className="  text-base font-light text-white mt-5 ">
            <p className="m-3  ">
              GST - <span className="ml-[3.2rem]">{item.GST}</span>
            </p>
            <p className="m-3">
              Address- <span className="ml-[1.4rem]"> {item.Address}</span>
            </p>
            <p className="m-3">
              Country - <span className="ml-[1.2rem]">{item.Country}</span>
            </p>
            <p className="m-3">
              State - <span className="ml-[2.5rem]">{item.State}</span>
            </p>
            <p className="m-3">
              Services -{" "}
              <span className="ml-[1.2rem]">
                {filteredServices?.map((item) => item.key).join(", ")}
              </span>
            </p>
          </span>
        </span>

        <span className="flex md:justify-around  justify-center flex-wrap  text-xl md:mt-9 sm:mt-9  py-2 gap-3 md:gap-0 sm:gap-5 ">
          <span>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2 cursor-pointer">
            <PiSwapLight />

              <p onClick={() => ticketRaiseDataWithClientsForAdmin(item._id)} className="m-0 ml-2 text-base"> {item.clientType.toLowerCase() === "regular"
              ? "Change to O"
              : "Change to R"}</p>
            </span>
          </span>

          <Link to={`/admin/edit-client-form/${item._id}`}>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2 cursor-pointer">
              <MdModeEdit />
              <p className="m-0 ml-2 text-base">Edit</p>
            </span>
          </Link>
          <span onClick={() => deleteClient(item._id)}>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2 cursor-pointer">
              <RiDeleteBin6Line />
              <p className="m-0 ml-2 text-base">Delete</p>
            </span>
          </span>
        </span>
      </span>
      </div>
    </span>
  );
};

export default Card;