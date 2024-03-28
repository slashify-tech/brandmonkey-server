import React, { useEffect, useState } from "react";
import { BrandIcon } from "../../../Icon";
import Navbar from "../AllServices/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import apiurl from "../../../util";

import { toast } from "react-toastify";
import Header from "../AllServices/Header";
import { useEmployee } from "../../../context/employeeContext";


const AddEmployee = ({ edit }) => {
  const [empForm, setEmpForm] = useState({
    employeeId: "",
    team: "",
    name: "",
    designation: "",
    phoneNumber: "",
    service: [],
    email: "",
    password: "",
    image : "",
    ImageFile : ""
  });
  const navigate = useNavigate();

  const { id } = useParams();

  const getOneEmployee = async () => {
    try {
      const response = await apiurl.get(`/getOneEmployee/${id}`);
      setEmpForm({
        employeeId: response.data.employee.employeeId,
        team: response.data.employee.team,
        image: response.data.employee.image,
        name: response.data.employee.name,
        designation: response.data.employee.designation,
        phoneNumber: response.data.employee.phoneNumber,
        service: response.data.employee.services.split(","),
        email: response.data.employee.email,
        password: response.data.employee.password,
      });
    } catch (err) {
      console.log(err);
    }
  };
  
  const { addEmployee, services } = useEmployee();

  
  const handleSubmit = async () => {
    try {
      addEmployee(empForm, edit, id);
      navigate("/admin/allemployee");
      toast.success("Employee added successfully");
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Assuming single file upload
    setEmpForm((prevData) => ({
      ...prevData,
      ImageFile: file, // Store the file object
    }));
  };

  const EmpFormHandler = (e) => {
    const { name, value } = e.target;

    if (name === "service") {
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setEmpForm((Emp) => ({
        ...Emp,
        [name]: [...Emp.service, ...selectedOptions],
      }));
    } else if (name === "removeService") {
      // Handle removing a service
      const serviceToRemove = value;
      setEmpForm((Emp) => ({
        ...Emp,
        service: Emp.service.filter((service) => service !== serviceToRemove),
      }));
    } else {
      setEmpForm((Emp) => ({
        ...Emp,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (id && edit) {
      getOneEmployee();
    }
  }, []);

  return (
    <>
      <span className="w-full h-full flex flex-col sm:flex-row bg-[#f5cd15]">
      <span className="bg-[#f5cd15] md:block hidden">
        <span className="ml-4 mt-4 sm:mt-0">
          <BrandIcon />
        </span>

        <Navbar />
      </span>
      <span className="md:w-[95%] sm:w-full w-full bg-black md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen font-poppins text-white">
      <Header/>
          <h1 className=" md:ml-20 ml-6 md:text-[30px] text-[23px] font-normal mt-10 mb-6 ">
            Employee Form
          </h1>
          <form>
            <div className=" md:mx-20 mx-6 flex flex-wrap gap-3 font-normal border rounded-xl py-9 px-5 ">
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4 ">
                <span>Employee ID*</span>
                <input
                  type="text"
                  name="employeeId"
                  id="employeeId"
                  className=" h-[6vh] sm:h-[3vh] md:h-[6vh]  bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Employee ID"
                  value={empForm?.employeeId}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4 ">
                <span>Name of the Employee*</span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className=" h-[6vh] sm:h-[3vh] md:h-[6vh]  bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Employee Name"
                  value={empForm?.name}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Designation</span>
                <input
                  type="text"
                  name="designation"
                  id="designation"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4]  rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Employee Designation"
                  value={empForm?.designation}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Email Id </span>
                <input
                  type="text"
                  name="email"
                  id="email"
                  className=" h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Employee Email"
                  value={empForm?.email}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Password </span>
                <input
                  type="text"
                  name="password"
                  id="password"
                  className=" h-[6vh] md:h-[6vh] sm:h-[3vh] bg-[#c5c4c4] w-full rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Employee Password"
                  value={empForm?.password}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>

              <div className="flex flex-col md:w-[45%]  w-full gap-3 md:ml-4">
                <span>Phone no.</span>
                <input
                  type="number"
                  name="phoneNumber"
                  className=" md:h-[6vh] h-[6vh] sm:h-[3vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Eemployee Phone number"
                  value={empForm?.phoneNumber}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%]  w-full gap-3 md:ml-4">
                <span>Services</span>
                <select
                  name="service"
                  id=""
                  onChange={(e) => EmpFormHandler(e)}
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  value={empForm?.service}
                >
                  <option value="">Choose Service</option>
                  {services?.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col mt-2 text-white font-normal">
                  <span>Selected Services</span>
                  {empForm?.service?.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {empForm?.service?.map((service, index) => (
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
              </div>

              <div className="flex flex-col  md:w-[45%] w-full gap-3 md:ml-4">
                <span>Teams</span>
                <input
                  type="text"
                  name="team"
                  placeholder="Assign Team"
                  className=" h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  value={empForm?.team}
                  onChange={(e) => EmpFormHandler(e)}
                />
              </div>
              <div className="flex flex-col  md:w-[45%] w-full gap-3 md:ml-4">
                <span>image</span>
                {empForm?.image && <input
                  type="text"
                  name="image"
                  placeholder="Assign Team"
                  className=" h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  value={empForm?.image}
                />}
                <input
                  type="file"
                  name="ImageFile"
                  id="imageFile"
                  className=" h-[5vh] bg-[#c5c4c4] rounded-md mb-2 px-2 pt-1 "
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </form>
          <div
            onClick={handleSubmit}
            className=" cursor-pointer md:w-[10%] w-[30%] h-[6vh] md:ml-[45%] ml-6 md:h-[6vh] sm:h-[3vh] bg-[#000000]   mb-6 mt-9 rounded-lg text-primary border-gradient  text-[17px] flex items-center justify-center  hover:text-black hover:bg-primary "
          >
            Submit
          </div>
          </span>
          </span>
    </>
  );
};

export default AddEmployee;