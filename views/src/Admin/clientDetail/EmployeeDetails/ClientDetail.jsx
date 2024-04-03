import React, { useEffect, useState } from "react";
import ExchangeCard from "./ExchangeCard";
import DeliverCard from "./ReviewList";
import Card from "./Card";
import { BrandIcon } from "../../../Icon";
import Navbar from "../../DashBordPage/Navbar";
import { useParams } from "react-router-dom";
import apiurl from "../../../util";

import Header from "../../DashBordPage/Header";

const ClientDetails = () => {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState({});
  const [service, setService] = useState({});
  const [ticket, setTicket] = useState([]);
  const [momData, setMOMData] = useState([]);
  const [isPopupOpen1, setPopupOpen1] = useState(false);
  const [isPopupOpen2, setPopupOpen2] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedMOM, setSelectedMOM] = useState(null);

  const getOneClient = async () => {
    try {
      if (!clientId) return;
      const response = await apiurl.get(`/getOneClient/${clientId}`);
      setClientData(response.data);
      const filteredService = Object.fromEntries(
        Object.entries(response.data).filter(
          ([key, value]) =>
            !["_id", "name", "ticketsCount", "__v", "clientType", "clientLogo", "colorZone", "logo", "Address", "Country", "GST", "State"].includes(key) &&
            ![null, undefined, "", "-", "NA", " NA", " NA ", "NA "].includes(value)
        )
      );
      setService(filteredService);
    } catch (error) {
      console.error("Error getting client data:", error);
    }
  };

  const getTicketForClient = async () => {
    try {
      if (!clientId) return;
      const response = await apiurl.get(`/getOneClientOrEmployeeTickets?clientId=${clientId}`);
      setTicket(response.data.tickets);
    } catch (error) {
      console.error("Error getting tickets:", error);
    }
  };

  const getMOMForClient = async () => {
    try {
      if (!clientId) return;
      const response = await apiurl.get(`/getmom/${clientId}`);
      setMOMData(response.data);
    } catch (error) {
      console.error("Error getting MOM data:", error);
    }
  };

  const handleTicketClick = (index) => {
    if (ticket && ticket[index]) {
      setSelectedTicket(ticket[index]);
      setPopupOpen2(true);
    }
  };

  const handleMOMClick = (index) => {
    if (momData && momData[index]) {
      setSelectedMOM(momData[index]);
      setPopupOpen1(true);
    }
  };

  useEffect(() => {
    getOneClient();
    getTicketForClient();
    getMOMForClient();
  }, [clientId]);

  useEffect(() => {
    if (isPopupOpen2) getTicketForClient();
  }, [isPopupOpen2]);

  useEffect(() => {
    getMOMForClient()
    if (isPopupOpen1) getMOMForClient();
  }, [isPopupOpen1]);

  return (
    <div className="w-full flex bg-[#f5cd15] font-poppins">
      <div className="bg-[#f5cd15] md:block hidden  h-screen">
        <div className="ml-4 mt-4 sm:mt-0">
          <BrandIcon />
        </div>
        <Navbar />
      </div>
      <div className="w-full bg-black overflow-x-hidden h-screen md:rounded-tl-[2rem] md:rounded-bl-[2rem] ">
        <Header />
        <ExchangeCard clientData={clientData} />
        <div className="md:mx-[4%]  ">
          <Card service={service} />
        </div>
        <DeliverCard
          ticket={ticket}
          momData={momData}
          selectedTicket={selectedTicket}
          selectedMOM={selectedMOM}
          isPopupOpen1={isPopupOpen1}
          isPopupOpen2={isPopupOpen2}
          setPopupOpen1={setPopupOpen1}
          setPopupOpen2={setPopupOpen2}
          clientData={clientData}
          handleMOMClick={handleMOMClick}
          handleTicketClick={handleTicketClick}
        />
      </div>
    </div>
  );
};

export default ClientDetails;
