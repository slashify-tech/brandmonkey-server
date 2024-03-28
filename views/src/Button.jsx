import React from "react";

const Button = ({ setPage, allPageData }) => {
  return (
    <>
      <div className="flex justify-center  my-4 z-50">
        <span
          onClick={() => setPage(allPageData?.previousPage)}
          disabled={allPageData?.currentPage === 1}
          className={`border-gradient text-primary hover:bg-primary hover:text-black px-4 py-2 rounded-lg cursor-pointer ${
            allPageData?.currentPage === 1 && "hidden"
          }`}
        >
          Previous
        </span>
        
        <span className="mx-4 mt-2 text-primary">
          Page {allPageData?.currentPage} of {allPageData?.lastPage}
        </span>
        <div
          onClick={() => setPage(allPageData?.nextPage)}
          disabled={allPageData?.currentPage === allPageData?.lastPage}
          className={`border-gradient hover:bg-primary hover:text-black text-primary px-4 py-2 rounded-lg cursor-pointer ${
            allPageData?.currentPage === allPageData?.lastPage && "hidden"
          }`}
        >
          Next
        </div>
      </div>
    </>
  );
};

export default Button;
