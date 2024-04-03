import React, { useEffect, useState } from "react";
import { BrandIcon } from "../../../Icon";
import Navbar from "../AllServices/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";

import apiurl from "../../../util";
import setupInterceptors from "../../../Interceptors";
import Header from "../AllServices/Header";
import { useAuth } from "../../../context/loginContext";
import { useEmployee } from "../../../context/employeeContext";


const CreateClient = ({ edit }) => {
  const { services } = useEmployee();
  const { tokenId } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const initialClientForm = services.reduce(
    (acc, service) => {
      acc[service] = "NA";
      return acc;
    },
    { name: "", Country: "", GST: "", State: "", Address: "" }
  );

  const [clientForm, setClientForm] = useState(initialClientForm);

  const handleSubmit = async () => {
    if (tokenId) {
      try {
        setupInterceptors(tokenId);
        let response;
        if (edit && id) {
          response = await apiurl.put(`/editClient/${id}`, { ...clientForm });

          toast.success("Edited successfully");
        } else {
          response = await apiurl.post("/addClient", { ...clientForm });
          navigate("/admin/allclients");
          toast.success("Client added successfully");
        }
        // navigate('/');
      } catch (error) {
        console.error("Error adding client:", error);
        toast.error("Something went wrong");
      }
    }
  };

  const getOneClient = async () => {
    try {
      let response;
      response = await apiurl.get(`/getOneClient/${id}`);
      const { _id, ...clientDataWithoutId } = response.data;

      setClientForm(clientDataWithoutId);

      console.log("got Client successfully:", response.data);
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const FormHandler = (e) => {
    const { name, value } = e.target;
    setClientForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  useEffect(() => {
    if (edit) {
      getOneClient(id);
    }
  }, []);

  return (
    <>
      <span className=" flex flex-col sm:flex-row bg-[#f5cd15]  font-poppins">
      <span className="bg-[#f5cd15] md:block hidden  h-screen">
        <span className="ml-4 mt-4 ">
          <BrandIcon />
        </span>

        <Navbar />
      </span>
      <span className="w-full bg-black   md:rounded-tl-[2rem] md:rounded-bl-[2rem] overflow-x-hidden h-screen">
        <Header />
        <div className="w-[70%]  p-3 right-10   rounded-lg  text-[#000000] text-center flex flex-col justify-between items-start">
          <h1 className="md:ml-4 ml-6 md:text-[28px] text-[25px] text-white font-semibold mt-5 mb-6">Client Form</h1>
          <form>
            <div className="md:mx-4 sm:mx-6 flex flex-wrap w-full md:ml-28  md:gap-3 font-normal  border rounded-xl px-9 pb-9 text-white text-start  ">
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4  mt-5">
                <span>Name of the Client*</span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] text-black rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="client name "
                  value={clientForm.name}
                  onChange={(e) => FormHandler(e)}
                />
              </div>

              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4 mt-5">
                <span>Client State*</span>
                <input
                  type="text"
                  name="State"
                  id="State"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter State"
                  value={clientForm.State}
                  onChange={(e) => FormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Client Country *</span>
                <input
                  type="text"
                  name="Country"
                  id="Country"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter Country "
                  value={clientForm.Country}
                  onChange={(e) => FormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Client GST No.*</span>
                <input
                  type="text"
                  name="GST"
                  id="GST"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter GST number"
                  value={clientForm.GST}
                  onChange={(e) => FormHandler(e)}
                />
              </div>
              <div className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4">
                <span>Client Address*</span>
                <input
                  type="text"
                  name="Address"
                  id="Address"
                  className="h-[6vh] sm:h-[3vh] md:h-[6vh] bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                  placeholder="Enter client Address"
                  value={clientForm.Address}
                  onChange={(e) => FormHandler(e)}
                />
              </div>
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex flex-col md:w-[45%] w-full gap-3 md:ml-4"
                >
                  <span>{service}</span>
                  <input
                    type="text"
                    name={service}
                    className="h-[6vh] sm:h-[3vh] md:h-[6vh]  bg-[#c5c4c4] rounded-md mb-2 px-2 placeholder:text-slate-700"
                    placeholder={`Enter ${service} or put "NA" if empty`}
                    value={clientForm[service]}
                    onChange={(e) => FormHandler(e)}
                  />
                </div>
              ))}
            </div>

            <Link
              to="/admin/allclients">
              <span
              onClick={handleSubmit}
              className="cursor-pointer md:w-[20%] w-[30%] h-[6vh] md:h-[6vh] sm:h-[3vh] border-gradient  mb-6 mt-9 rounded-lg bg-black text-primary z-50 text-[17px] flex items-center justify-center hover:text-black hover:bg-primary md:mx-[58%] sm:mx-6 mx-6"
            >
              {edit ? "Save" : "Submit"}</span>
            </Link>
          </form>
        </div>
        
        
        </span>
      </span>
      
      
    </>
  );
};

export default CreateClient;
