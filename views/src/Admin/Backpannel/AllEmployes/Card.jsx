import React from "react";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import CardProfile2 from "../../../assets/CardProfile2.png";
import { Link } from "react-router-dom";
import setupInterceptors from "../../../Interceptors";

import apiurl from "../../../util";
import { useAuth } from "../../../context/loginContext";


const Card = ({ item, setClient }) => {
  const { tokenId } = useAuth();

  const deleteEmployee = async (id) => {
    if (tokenId) {
      setClient(true);
      setupInterceptors(tokenId);
      try {
        await apiurl.delete(`/deleteEmployee/${id}`);
        setClient(false);
      } catch (err) {
        console.log(err);
      }
    }
  };
  return (
    <span className="border-gradient rounded-3xl  mx-6 m-2 flex flex-col   font-poppins  ">
      <span className="text-white mx-5  flex justify-center items-center mt-3 ">
        <span className=" flex ">
        {item && item?.imageUrl ? (
              <div className="">
                <img
                  src={item?.imageUrl}
                  width={60}
                  height={60}
                  alt="img"
                  className=" rounded-full m-3 mt-2 ml-1.5 "
                />
              </div>
            ) : (
              <img src="./Profile.png" width={60} height={60} alt="img"      className=" rounded-full m-3 mt-2 ml-1.5 "/>
 )}
          <span>
            {" "}
            <p className=" font-poppins text-md mt-3">{item.name}</p>
          </span>
        </span>
      </span>

      <span className="w-full h-full gradient rounded-br-3xl rounded-bl-3xl mt-5  ">
        <span className="  text-base font-light text-white mt-5 ">
          <p className="m-3  ">
            EID - <span className="ml-[5.5rem]">{item.employeeId}</span>
          </p>
          <p className="m-3">
            Name - <span className="ml-[4rem]">{item.name}</span>
          </p>
          <p className="m-3">
            Designation- <span className="ml-[1.4rem]">{item.designation}</span>
          </p>
          <p className="m-3 overflow-scroll scrollbar-hide">
            Email - <span className="ml-[4.5rem] mr-5 md:pe-0">{item.email}</span>
          </p>
          <p className="m-3">
            Phone Number - <span className=""> {item.phoneNumber}</span>
          </p>
          <p className="m-3">
            Services - <span className="ml-[3.2rem]">{item.services}</span>
          </p>
        </span>

        <span className="flex md:justify-around  justify-center flex-wrap  text-xl md:mt-9 sm:mt-9  py-2 gap-3 md:gap-0 sm:gap-5">
          <Link to={`/admin/client-allot/${item._id}`}>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2  cursor-pointer ">
              <img src={CardProfile2} className="w-5 h-5" />
              <p className="m-0 ml-2 text-base">Allot Client</p>
            </span>
          </Link>
          <Link to={`/admin/edit-employee-form/${item._id}`}>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2 cursor-pointer">
              <MdModeEdit />
              <p className="m-0 ml-2 text-base">Edit</p>
            </span>
          </Link>
          <span onClick={() => deleteEmployee(item._id)}>
            <span className="flex items-center bg-black text-primary rounded-lg px-4 py-2 cursor-pointer">
              <RiDeleteBin6Line />
              <p className="m-0 ml-2 text-base">Delete</p>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
};

export default Card;