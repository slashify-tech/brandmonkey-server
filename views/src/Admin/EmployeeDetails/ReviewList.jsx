import React, { useEffect, useState } from "react";


import { Link } from "react-router-dom";
import apiurl from "../../util";
import { useEmployee } from "../../context/employeeContext";

const dateString = (dateStr) => {
  const dateObject = new Date(dateStr);
  const date = dateObject.toDateString();
  return date;
};

const ReviewList = ({ id }) => {
  const { fetchReviews, reviews } = useEmployee();
  const [hits, setHits] = useState([]);

  const getHitData = async () => {
    try {
      const response = await apiurl.get(`/gethitemployee/${id}`);
      setHits(response.data.hits);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchReviews(id);
    getHitData();
  }, [fetchReviews]);


  return (
    <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 md:mx-9 mx-4 me-6 md:me-8 sm:me-0  md:gap-5 sm:ml-12 md:ml-9 text-white font-normal mb-5">
      <span>
        <p className="text-white   font-poppins font-medium  text-xl md:ml-[7%] sm:ml-[5%] ml-[5%] mt-[3px] mb-[5px] ">
          Work Done in Slots ( Monthly )
        </p>
        <span className=" w-full h-[30%] md:flex sm:flex justify-center  ">
          <span className=" mb-8  " id="card-item2">
            <span className="md:w-[65vh] w-full sm:w-[32vh] h-[50vh] md:h-[50vh] sm:h-[35vh] gradient border-gradient rounded-3xl pt-1 flex flex-col m-2 overflow-y-scroll scrollbar-hide">
            {hits && hits?.length > 0 ? (
              <>
            {hits?.map((item, index) => (
                <p className="text-white font-poppins font-normal ml-[2rem] m-0 pt-4 ">
                  {item.clientName} - {(item.noOfHits * 30) / 60}hrs  
                </p>
              ))}   </>):(  <p className="p-5">No hits logged yet...</p>)}
            </span>
          </span>
        </span>
      </span>

      <span>
        <p className="text-white   font-poppins font-medium text-xl md:ml-[7%] ml-2   sm:mt-[5%] md:mt-[6px] mt-9 mb-[8px]">
          Review List
        </p>
        <span className=" w-full h-[30%] md:flex sm:flex justify-start ">
          <span className=" mb-8 " id="card-item2">
          <div className="md:w-[65vh] w-full sm:w-[32vh] h-[50vh] md:h-[50vh] sm:h-[35vh] md:ml-0 gradient border-gradient rounded-3xl pt-1 flex flex-col md:m-2 overflow-y-scroll scrollbar-hide">
  {reviews?.reviews?.map((item, index) => (
    <Link key={index} to={`/admin/view-review/${id}/${reviews?._id}/${item._id}`} className="text-white font-poppins font-normal ml-[2rem] m-0 pt-4">
      {dateString(item.updatedAt)} <span className="text-blue-700 underline cursor-pointer">,click here</span>
    </Link>
  ))}
  {!reviews?.reviews?.length && <p className="p-5">No reviews generated yet...</p>}
</div>

          </span>
        </span>
      </span>
    </div>
  );
};

export default ReviewList;