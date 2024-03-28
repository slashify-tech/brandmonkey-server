import React from "react";

const Card = ({service}) => {
  // Function to remove "Yes", "yes", or "YES" from values
  const sanitizeValue = (value) => {
    return (value.replace(/Yes/gi, "").replace(/-/gi, ""));
  };
  return (
    <>
      <p className="text-white   font-poppins font-medium text-xl ml-[9%] md:ml-6 md:mt-[4%] mb-[5px] sm:ml-11 mt-9">
        Deliverables :
      </p>
      <span className="  flex justify-start  mr-8 ml-3 md:ml-0 md:mr-0 sm:mx-8 sm:mr-11 ">
        <span className=" mb-8  w-full ">
          <span className="w-full py-5 gradient border-gradient h-[37vh] rounded-3xl pt-1 flex flex-col m-2 overflow-y-scroll scrollbar-hide">
            {service &&
              Object.entries(service).map(([key, value], index) => (
                <p key={index} index={index} className="text-white font-poppins font-normal ml-[2rem] m-0 pt-4">
                  <span>
                    {index + 1}. {" "}
                  </span>{" "}
                  {`${key} =>  ${sanitizeValue(value) }`}
                </p>
              ))}
          </span>
        </span>
      </span>
    </>
  );
};

export default Card;