import React, { useEffect } from "react";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

// gradient;
const Card = ({
  item,
  setAction,
  action,
  setOldService,
  setNewService,
  refer,
  deleteServiceField,
}) => {


  return (
    <span className=" overflow-hidden shadow-lg  md:px-2 z-50 ">
      <span className="py-2  gradient-color flex items-center justify-between rounded-xl   md:px-5  px-2 sm:px-5  ">
        <p className="font-extralight text-lg text-white ">{item}</p>
        <span className="flex  justify-center items-center  text-xl  gap-2 ">
          <span
            className="flex items-center bg-black text-[#f5cc15d4] rounded-lg md:px-4 sm:px-4 px-2  py-2 cursor-pointer"
            onClick={() => {
              console.log("clicked");
              setAction({ ...action, edit: true });
              setOldService(item);
              setNewService(item);
              refer.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <MdModeEdit />
            <p className=" ml-2  text-base ">Edit</p>
          </span>

          <span>
            <span
              className="flex items-center bg-black text-primary rounded-lg md:px-4 px-2 py-2 cursor-pointer"
              onClick={() => {
                deleteServiceField(item);
                setAction({ ...action, delete: true });
              }}
            >
              <RiDeleteBin6Line />
              <p className="ml-2 text-base ">Delete</p>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
};

export default Card;
