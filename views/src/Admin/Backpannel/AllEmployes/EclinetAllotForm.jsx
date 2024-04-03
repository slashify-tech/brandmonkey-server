import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { Link, useNavigate  } from "react-router-dom";
import { toast } from "react-toastify";
import apiurl from "../../../util";
import setupInterceptors from "../../../Interceptors";


const EclientAllotForm = () => {
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceClient, setServiceClient] = useState({
    client: "",
    service: [],
    employeeName: id,
  });
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(true);

  const closePopup = () => {
    setPopupOpen(false);
  };

  const getClients = async () => {
    try {
      const response = await apiurl.get(`/getClients`);
      setClients(response.data.result.data.map((item) => item.name));
    } catch (err) {
      console.log(err);
    }
  };

  const getEmployee = async () => {
    if (id) {
      try {
        const response = await apiurl.get(`/getOneEmployee/${id}`);
        setServices(response.data.employee.services.split(","));
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
      }
    }
  };

  const EmpFormHandler = (e) => {
    const { name, value } = e.target;

    if (name === "service") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setServiceClient((prevData) => ({
        ...prevData,
        service: [...prevData.service, ...selectedOptions],
      }));
    } else if (name === "removeService") {
      const serviceToRemove = value;
      setServiceClient((prevData) => ({
        ...prevData,
        service: prevData.service.filter((service) => service !== serviceToRemove),
      }));
    } else {
      setServiceClient((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const submitForm = async () => {
    let {client,
    service,
    employeeName} = serviceClient;
    service = service.join(",")
    if (id && serviceClient.service.length > 0) {
      try {
        await apiurl.put(`/clientAllocation/${id}`, {   client,
          service,
          employeeName});
        toast.success("Client Allotted");
        closePopup();
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
        navigate("/admin/allemployee")
      }
    } else {
      toast.error("Please select at least one service");
    }
  };

  useEffect(() => {
    getClients();
    getEmployee();
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
              onChange={EmpFormHandler}
            >
              <option value=""></option>
              {clients.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <p className="mt-9">Service Alloted </p>

            <select
              name="service"
              id=""
              className="md:w-[95%] w-full h-[6vh] mt-3 px-2  rounded-md cursor-pointer"
              onChange={EmpFormHandler}
            >  <option>Select Service</option>
              {services?.map((item, index) => (
              
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="flex flex-col md:w-[45%]  w-full gap-3 md:ml-4">
              <span>Selected Services</span>
              {serviceClient.service.length > 0 ? (
                <ul className="list-disc pl-5">
                  {serviceClient.service.map((service, index) => (
                    <li key={index}>
                      {service}
                      <button
                        type="button"
                        className="text-red-500 ml-2 bg-black cursor-pointer"
                        onClick={() =>
                          EmpFormHandler({
                            target: {
                              name: "removeService",
                              value: service,
                            },
                          })
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No service selected</p>
              )}
            </div>

            <div className="flex justify-center items-center mt-20 mb-5">
            <Link to = "/admin/allemployee">
              <span
                className="px-5 py-2 text-[#F5CD15] bg-black BR rounded-lg mt-5 cursor-pointer "
                onClick={submitForm}
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