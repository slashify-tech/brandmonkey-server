import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiurl from "../../../util";
import { useEmployee } from "../../../context/employeeContext";

const TicketForm = () => {

  const [ticketForm, setTicketForm] = useState({
    forClients: "",
    toEmployee: "",
    services: "",
    description: "",
  });

  const navigate = useNavigate();

  const { id } = useParams();
  const { services } = useEmployee();
  const [service, setService] = useState([]);
  const [employees, setEmployees] = useState([]);

  const TicketFormHandler = (e) => {
    const { name, value } = e.target;
    if (id) {
      setTicketForm((Ticket) => ({
        ...Ticket,
        forClients: id,
        [name]: value,
      }));
    }
  };

  const getEmployee = async () => {
    try {
      const response = await apiurl.get(`/getEmployees`);
      setEmployees(
        response.data.result.data.filter((item) => {
          const serviceEmp = item.services
            .split(",")
            .map((item) => item.trim());
          return serviceEmp.includes(ticketForm.services.trim());
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const getOneClient = async () => {
    if (id) {
      try {
        let response;
        response = await apiurl.get(`/getOneClient/${id}`);
        
        setService(
          Object.fromEntries(
            Object.entries(response.data).filter(
              ([key, value]) =>
                key !== "_id" &&
                key !== "name" &&
                key !== "ticketsCount" &&
                key !== "__v" &&
                key !== "clientType" &&
                key !== "Address" &&
                key !== "Country" &&
                key !== "GST" &&
                key !== "State" &&
                key !== "clientLogo" &&
                key !== "colorZone" &&
                value !== "NA"
            )
          )
        );

      } catch (error) {
        console.error("Error adding client:", error);
        toast.error("Error adding client:");
      }
    }
  };

  const submitTicketForm = async () => {
    try {
      if (
        !ticketForm.forClients ||
        !ticketForm.toEmployee ||
        !ticketForm.services ||
        !ticketForm.description
      ) {
        console.error("Please fill all required fields");
        toast.error("Please fill all required fields");
        return;
      }

      const response = await apiurl.post(`/submitTicket`, ticketForm);
      toast.success("Ticket raised Successfully");
      // console.log(response.data);
      navigate(`/admin/client-detail/${id}`);
    } catch (error) {
      // console.error("Error submitting ticket:", error);
      toast.error("Error while submitting ticket");
    }
  };

  useEffect(() => {
    getEmployee();
    getOneClient();
  }, [ticketForm.services]);


  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll  `}
     
    >
      <div className="bg-black p-4 mx-3 md:mt-0 mt-20 md:p-7 rounded-lg  md:w-[50%] w-full relative shadow text-white font-poppins ">
        <Link
          to={`/admin/client-detail/${id}`}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={30} color="white" />
        </Link>

        <div className="mt-5">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
           Raise Ticket
          </h1>
        </div>

        <form className="mt-4 md:ml-12 ">
          <p className="mt-3  font-normal">Services * </p>
          <select
            className="md:w-[90%] w-full h-[6vh] mt-2 px-2 rounded-md cursor-pointer text-black"
            name="services"
            id="services"
            onChange={(e) => TicketFormHandler(e)}
          >
            <option value="">Choose Services</option>
            {service &&
              Object.entries(service)?.map(([key, value], index) => (
              <option key={index} value={key}>
                {key}
              </option>
            ))}
          </select>

          <p className="mt-3 font-normal">Assign Employee</p>
          <select
            className="md:w-[90%] w-full h-[6vh] mt-2 px-2  rounded-md cursor-pointer text-black"
            name="toEmployee"
            id="toEmployee"
            onChange={(e) => TicketFormHandler(e)}
          >
            <option value="">Select Employee</option>
            {employees?.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} - {employee.designation}
              </option>
            ))}
          </select>

          <p className="mt-3  font-normal">Description </p>
          <textarea
            className="md:w-[88%] w-[96%] h-[20vh] mt-2 px-2 rounded-md p-2 text-black"
            type="text"
            name="description"
            value={ticketForm.description}
            onChange={(e) => TicketFormHandler(e)}
          />

          <div className="flex justify-center items-center mb-9 mt-9">
            <span>
              <span
                className="px-5 py-2 text-[#F5CD15] bg-black BR rounded-lg mt-5 cursor-pointer"
                onClick={() => {
                  submitTicketForm(), closePopup();
                }}
              >
                Submit
              </span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;