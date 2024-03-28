import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

import apiurl from "../../../util";
import setupInterceptors from "../../../Interceptors";
import { useAuth } from "../../../context/loginContext";

const EclientAllotForm = () => {
  const { id } = useParams();
  const { tokenId } = useAuth();
  const [clients, setClients] = useState();
  const [isPopupOpen, setPopupOpen] = useState(true);
  const [services, setServices] = useState("");
  const [serviceClient, setServiceClient] = useState({
    client: "",
    service: "",
    employeeName: id,
  });
  const closePopup = () => {
    setPopupOpen(false);
  };
  const getEmployee = async () => {
    if (id) {
      try {
        const response = await apiurl.get(`/getOneEmployee/${id}`);

        setServices(response.data.employee.services);
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      }
    }
  };

  const getClients = async () => {
    if (id) {
      try {
        const response = await apiurl.get(`/getClients`);
        setClients(response.data.result.data.map((item) => item.name));
      } catch (err) {
        console.log(err);
      }
    }
  };
  const clinetAllocation = async () => {
    if (id && tokenId) {
      setupInterceptors(tokenId);
      try {
        await apiurl.put(`/clientAllocation/${id}`, { ...serviceClient });

        toast.success("Client Allotted");
      } catch (err) {
        console.log(err);
      }
    }
  };

  const EmpFormHandler = (e) => {
    const { name, value } = e.target;

    setServiceClient((Emp) => ({
      ...Emp,
      [name]: value,
    }));
  };
  const submitForm = () => {
    console.log("submitted");
  };

  useEffect(() => {
    getEmployee();
    getClients();
  }, []);
  console.log(services);
  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll  ${
          isPopupOpen ? "block" : "hidden"
        }`}
      >
        <div className="bg-[#000000] p-4 mx-3 md:mt-0 mt-20 md:p-7 rounded-lg  md:w-2/4 w-full relative  text-white ">
          <Link to="/admin/allemployee">
            <button
              className="absolute top-2 bg-black right-2 text-gray-500 hover:text-gray-800 cursor-pointer"
              onClick={closePopup}
            >
              <IoClose size={30} color="white" />
            </button>
          </Link>

          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-center">
              Clients Allocation
            </h1>
          </div>

          <form className="mt-12 md:ml-9 ">
            <p className="mt-3">Clients Alloted * </p>

            <select
              name="client"
              className="md:w-[95%] w-full h-[6vh] mt-3 px-2 rounded-md cursor-pointer  "
              id=""
              onChange={(e) => EmpFormHandler(e)}
            >
              <option value=""></option>
              {clients?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <p className="mt-9">Service Alloted </p>
            {/* <input
              className="md:w-[90%] w-full h-[25vh] mt-2"
              type="text"
              value={serviceClient?.service}
              
            /> */}
            <select
              name="service"
              id=""
              className="md:w-[95%] w-full h-[6vh] mt-3 px-2  rounded-md cursor-pointer"
              onChange={(e) => EmpFormHandler(e)}
            >
              <option value=""></option>
              {services?.split(",")?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="flex justify-center items-center mt-20 mb-5">
              <Link to="/admin/allemployee">
                <span
                  className="px-5 py-2 text-[#F5CD15] bg-black BR rounded-lg mt-5 cursor-pointer "
                  onClick={() => {
                    clinetAllocation(), closePopup();
                  }}
                >
                  Submit
                </span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EclientAllotForm;
