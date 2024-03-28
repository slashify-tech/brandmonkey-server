import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiurl from "../../util";
import { ToastContainer, toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
const ReviewForm = () => {
  const { id } = useParams();
  const [reviewData, setreviewData] = useState({
    employeeData: "",
    client: "",
    goodOrBad: "",
    review: "",
  });
  const [clients, setClients] = useState();
  const [isPopupOpen, setPopupOpen] = useState(true);

  const inputHandler = (e) => {
    const { name, value } = e.target;
    setreviewData((data) => ({ ...data, employeeData: id, [name]: value }));
  };

  const submitReviewForm = async () => {
    try {
      const response = apiurl.put(`/addReview`, { ...reviewData });
      toast.success("Review added successfully");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const getClientData = async () => {
    try {
      const response = await apiurl.get(`/getclientemployeedistribution/${id}`);
      setClients(response.data.map((item) => item.clientName));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getClientData();
  }, [id]);

  const closePopup = () => {
    setPopupOpen(false);
  };
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#333333] z-50 shadow font-poppins overflow-y-scroll pt-32${
        isPopupOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-[#000000] text-white p-4 mx-3 md:mt-0 mt-9 md:p-7 rounded-lg  md:w-[50%] w-full relative shadow">
        <Link
          to={`/admin/employee-detail/${id}`}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={closePopup}
        >
          <IoClose size={30} color="white" />
        </Link>

        <div className="mt-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-center">
            Add Review
          </h1>
        </div>

        <form className="mt-4 md:ml-12 ">
          <p className="mt-3 font-normal"> Client</p>
          <select
            name="client"
            id=""
            className="md:w-[90%] w-full h-[6vh] mt-2 px-2 rounded-md cursor-pointer text-black"
            onChange={(e) => inputHandler(e)}
          >
            <option value="">Choose client</option>
            {clients?.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="mt-3  font-normal">Review</p>
          <select
            name="goodOrBad"
            id=""
            className="md:w-[90%] w-full h-[6vh] mt-2 px-2 rounded-md cursor-pointer text-black"
            onChange={(e) => inputHandler(e)}
          >
            <option value="">Choose</option>
            <option value="good">bad</option>
            <option value="bad">good</option>
          </select>

          <p className="mt-3  font-normal">Description</p>
          <textarea
            className="md:w-[88%] w-[96%] h-[20vh] p-3 mt-2 px-2 mb-5 rounded-md text-black"
            required
            type="text"
            value={reviewData.review}
            name="review"
            placeholder="Add Review Description..."
            onChange={(e) => inputHandler(e)}
          />

          <div className="flex justify-center items-center">
            <Link to={`/admin/employee-detail/${id}`}>
              <span
                className="px-5 py-2 BR text-[#F5CD15] bg-black mt-5 rounded-md cursor-pointer"
                onClick={() => {
                  submitReviewForm(), closePopup();
                }}
              >
                Submit
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
