import React, { useEffect, useRef, useState } from "react";
import { BrandIcon, Notification, Setting } from "../../../Icon";
import Navbar from "./Navbar";
import Card from "./Card";
import { useEmployee } from "../../../context/employeeContext";
import Header from "./Header";


const TotalEmploye = () => {
  const refer = useRef();
  const {
    getClients,
    addServiceField,
    editServiceField,
    deleteServiceField,
    services,
  } = useEmployee();
  const [clicked, setClicked] = useState(false);

  const [action, setAction] = useState({
    edit: false,
    delete: false,
  });
  const [newService, setNewService] = useState("");
  const [oldService, setOldService] = useState("");

  useEffect(() => {
    getClients();
    if (clicked) {
      // If a service has been deleted or edited, reload the services
      setClicked(false);
    }
  }, [action, clicked]);

  // Function to handle service deletion
  const handleDeleteService = (item) => {
    deleteServiceField(item);
    setClicked(true); // Indicate that a service has been deleted
  };
  return (
    <span className=" flex flex-col sm:flex-row bg-[#f5cd15]  font-poppins">
      <span className="bg-[#f5cd15] md:block hidden">
        <span className="ml-4 mt-4 ">
          <BrandIcon />
        </span>

        <Navbar />
      </span>
      <span className="w-full bg-black   md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen">
        <Header />
        <div className="w-[70%]  p-3 right-10   rounded-lg  text-[#000000] text-center flex flex-col justify-between items-start">
          <p className="text-white font-poppins  pt-9 mb-3 text-lg md:mx-16 mx-6">
            Add Service Name:
          </p>
          <span className="flex md:flex-row sm:flex-row flex-col  justify-between  w-full">
            
            
            
            <span className="flex flex-col  items-start md:ml-11" >
              {action.edit ? (
                <div
                  ref={refer}
                  className=" gradient border-gradient md:h-[25vh] h-[18vh] sm:h-[12vh] absolute flex flex-col md:w-[370px] w-[250px] sm:w-[370px] p-4 rounded-2xl top-10"
                >
                  <span className="md:text-[24px] mb-4 font-poppins font-semibold text-white">
                    Edit Service
                  </span>{" "}
                  <span
                    onClick={() => {
                      editServiceField(oldService, newService);
                      setNewService("");
                      setAction({ ...action, edit: false });
                    }}
                    className="px-2 cursor-pointer"
                  ></span>
                  <input
                    type="text"
                    name="newservice"
                    id=""
                    onChange={(e) => setNewService(e.target.value)}
                    value={newService}
                    className="bg-[#f5f4f4] px-3 md:h-[5vh] h-[3vh] sm:h-[2vh]  py-2 rounded-md md:w-[50vh] w-[25vh] sm:w-[25vh] mb-10"
                  />{" "}
                  <span
                    onClick={() => {
                      editServiceField(oldService, newService);
                      setNewService("");
                      setClicked(true);
                      setAction({ ...action, edit: false });
                    }}
                    className="cursor-pointer bg-black rounded-lg border-gradient  text-[#F5CD15] md:w-[30%]   text-center px-3 mx-3 py-2 "
                  >
                    Save Service
                  </span>
                </div>
              ) : (
                <>
                  {" "}
                  <span
                    onClick={() => {
                      addServiceField(newService);
                      setNewService("");
                      setAction({ ...action, edit: true });
                    }}
                    className="px-2 cursor-pointer"
                  ></span>
                  <input
                    type="text"
                    name="newservice"
                    id=""
                    placeholder="Add Service"
                    onChange={(e) => setNewService(e.target.value)}
                    value={newService}
                    className="border-none  rounded-xl h-12  md:w-[35vh] w-[30vh] bg-[#a1a0a0] px-3 ml-5 mb-3"
                  />{" "}
                  <span
                    onClick={() => {
                      addServiceField(newService);
                      setNewService("");
                      setClicked(true);
                    }}
                    className="text-primary cursor-pointer rounded-lg text-normal  border-gradient  px-8 py-2 text-center me-2 mb-2 ml-5 "
                  >
                    Submit
                  </span>
                </>
              )}
            </span>
            <span className="mt-5  mx-6 sm:mx-0 md:mx-0  md:mt-0 ">
            <span className="text-white gradient font-medium rounded-lg text-extralight  pt-3 px-8 py-3 text-center   ">
                Total : {services?.length}{" "}
              </span>
              </span>
          </span>
        </div>
        <span className="flex   justify-around flex-col md:mx-16 sm:mx-9 mx-6  ">
          <p className="text-white  text-lg  font-poppins mt-9 ml-3">
            Name Of Services:
          </p>

          <span className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 md:gap-8 gap-5  mt-3 mb-10  ">
            {services?.length > 0 &&
              services?.map((item, index) => (
                <Card
                  key={index}
                  item={item}
                  addServiceField={addServiceField}
                  action={action}
                  setAction={setAction}
                  setNewService={setNewService}
                  setOldService={setOldService}
                  refer={refer}
                  deleteServiceField={() => handleDeleteService(item)}
                />
              ))}
          </span>
        </span>
      </span>
    </span>
  );
};

export default TotalEmploye;
