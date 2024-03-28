import React from "react";
import { Link } from "react-router-dom";

const ExchangeCard = ({ clientData }) => {
  return (
    <>
      <p className="text-white font-poppins font-medium text-[20px] pb-9 md:mt-9  mt-5 md:mx-16 mx-6">
        Client Details :{/* Button positioned absolutely */}
      </p>
      <span className="flex flex-col items-center mt-20 md:mt-6 sm:mt-6">
        <span className="border-gradient rounded-3xl  pt-7   w-[90%] ">
          <p className="text-white text-[30px] font-poppins text-center md:text-start font-medium md:pl-8 pb-5 pt-5 md:pt-0">
            {clientData?.name}
          </p>

          <span className="relative">
            {clientData && clientData?.clientLogo ? (
              <div className="">
                <img
                  src={clientData?.clientLogo}
                  width={120}
                  height={120}
                  alt=""
                  className="absolute bg-slate-300 md:top-[-11rem] top-[-12rem] left-[50%] transform -translate-x-1/2 border-gradient rounded-full"
                />
              </div>
            ) : (
              <img
                src="./Profile.png"
                width={120}
                height={120}
                alt="img"
                className="absolute md:top-[-11rem] top-[-12rem] left-[50%] transform -translate-x-1/2 border-gradient rounded-full"
              />
            )}
            <span className="gradient rounded-br-3xl rounded-bl-3xl pt-5 pb-5 flex md:justify-around md:items-center ">
              <span className="w-[48%] font-light   text-[16px] py-5">
                <p className="text-white font-poppins  ml-[3rem] ">
                  <span className="font-semibold">Name</span> &rArr;{" "}
                  {clientData?.name}
                </p>
                <p className="text-white font-poppins  ml-[3rem] mt-6">
                  <span className="font-semibold">City / State</span> &rArr;{" "}
                  {clientData?.State}
                </p>
                <p className="text-white font-poppins  ml-[3rem] mt-6">
                  <span className="font-semibold">Country</span> &rArr;{" "}
                  {clientData?.Country}
                </p>
              </span>
              <span className="w-[48%]">
                <p className="text-white font-poppins font-light ml-[3rem] ">
                  <span className="font-semibold">GST</span> &rArr;{" "}
                  {clientData?.GST}
                </p>
                <p className="text-white font-poppins font-light  ml-[3rem] mt-6">
                  <span className="font-semibold">Address</span> &rArr;{" "}
                  {clientData?.Address}
                </p>
              </span>
            </span>
          </span>
        </span>
      </span>
    </>
  );
};

export default ExchangeCard;
