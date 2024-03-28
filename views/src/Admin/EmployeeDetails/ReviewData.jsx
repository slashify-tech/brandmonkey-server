// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import apiurl from '../../../util';

// const ReviewData = () => {
//     const {employeeId, reviewId} = useParams();
//     const [review, setReview] = useState("");
//     const getReview = async () => {
//         try{
//             const response = await apiurl.get(/employeeReviewsShow/${employeeId}?reviewId=${reviewId});
//             console.log(response.data);
//             setReview();
//         }catch(err) {
//             console.log(err);
//         }
//     }
//     console.log(review);
//     useEffect(() =>{
//         getReview();
//     },[])
//   return (
//     <div>ReviewData</div>
//   )
// }

// export default ReviewData

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiurl from "../../util";
import { IoClose } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";

const ReviewData = () => {
  const { employeeId, reviewParentId, reviewId } = useParams();
  const [reviews, setReviews] = useState();

  const getReviews = async () => {
    try {
      const response = await apiurl.get(
        `/employeeReviewsShow/${employeeId}?reviewId=${reviewId}`
      );
      setReviews(response.data.review);
      
    } catch (err) {
      console.log(err);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await apiurl.delete(`/deleteReviews/${reviewParentId}?reviewId=${reviewId}`);
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    getReviews();
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll pt-32`}
    >
      <div className="bg-[#000000] text-white p-4 mx-3 md:mt-0 mt-9 md:p-7 rounded-lg md:w-[50%] w-full relative shadow">
        <Link
          to={`/admin/employee-detail/${employeeId}`}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          <IoClose size={30} color="white" />
        </Link>

        <div>
          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-center">
              Employee Review
            </h1>
          </div>
          <span
            onClick={(e) => deleteReview(reviews?._id)}
            className="absolute top-2 left-2 text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <Link to={`/admin/employee-detail/${employeeId}`}>
              <RiDeleteBinLine size={25} color="maroon" />
            </Link>
          </span>
          <form className="mt-4 md:ml-12  ">
            <p className="mt-3 font-normal text-white">Client</p>
            <p className="md:w-[90%] w-[96%] h-[6vh] bg-white mt-2 px-2 rounded-md cursor-pointer text-black">
              {reviews?.client}
            </p>

            <p className="mt-3 font-normal text-white">Good or Bad</p>
            <p className="md:w-[90%] w-[96%] h-[6vh] bg-white mt-2 px-2 rounded-md cursor-pointer text-black">
              {reviews?.goodOrBad}
            </p>

            <p className="mt-3 font-normal text-white">Description</p>
            <p className="md:w-[88%] w-[96%] h-[20vh] bg-white p-3 mt-2 px-2 mb-5 rounded-md text-black">
              {reviews?.review}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewData;