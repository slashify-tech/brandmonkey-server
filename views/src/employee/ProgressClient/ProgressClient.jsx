import React, { useEffect, useState } from "react";
import { BrandIcon } from "../../Icon";
import Navbar from "../empDashboard/Navbar";
import Card from "./Card";
import apiurl from "../../util";

import Header from "../empDashboard/Header";
import { useAuth } from "../../context/loginContext";

const ProgressClient = () => {
  const { employeeData } = useAuth();
  const [clientType, setClientType] = useState("Regular");
  const [clients, setClients] = useState([]);
  const [click, setClick] = useState(false);

  const getClientData = async () => {
    if (employeeData?._id) {
      try {
        const response = await apiurl.get(`/getclientemployeedistribution/${employeeData._id}`);
        setClients(response.data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    getClientData();
  }, [click, employeeData?._id]);

  const handleClientTypeChange = (type) => {
    setClientType(type);
  };

  const filteredClients = clients.filter((client) => client.clientType === clientType);

  return (
    <div className="flex bg-primary font-poppins">
      <div className="child md:block hidden">
        <div className="ml-3">
          <BrandIcon />
        </div>
        <Navbar />
      </div>
      <div className="bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] md:w-[95%] w-[100%] h-screen overflow-scroll scrollbar-hide">
        <Header />
        <div className="flex justify-center items-center gap-5 mt-10 mb-9">
          {["Regular", "Onetime"].map((item, index) => (
            <div key={index} onClick={() => handleClientTypeChange(item)}>
              <div
                className={`${
                  clientType === item
                    ? "bg-primary hover:bg-transparent hover:text-primary text-black"
                    : "bg-transparent hover:bg-primary hover:text-black text-primary"
                } cursor-pointer border-gradient font-medium rounded-lg text-base px-8 py-2 text-center me-2 mb-2`}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-evenly">
          <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 mt-2 md:gap-9 gap-3">
            {filteredClients.map((item, index) => (
              <Card key={index} item={item} setClick={setClick} click={click} getClientData={getClientData} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressClient;
