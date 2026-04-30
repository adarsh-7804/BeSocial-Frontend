import React, { useState } from "react";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import RightPanel from "./RightPanel";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../features/userSlice"; 

const Setting = () => {
  const currentUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  

  const handleDelete = () => {
    if (window.confirm("Permanently delete this account?")) {
      dispatch(deleteUser()).then(() => navigate("/"));
    }
  };

 



  return (
    <div className="bg-[#FDF6EE] min-h-screen">
      <Navbar />

      <div className="flex flex-row justify-between">
        {/* Left Sidebar */}
        <div className="ml-[8vw]">
          <SideBar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col mx-3.5 mt-3 min-w-0">
          {/* Account Activity Card */}
          <div className="rounded-2xl border border-[#EFDED0] shadow-2xs bg-[#FFFDFA]/60 p-4 mt-1 mb-6">
            <p className="text-[10px] font-bold text-[#433725] uppercase tracking-widest mb-3">
              Account Activity
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="w-full bg-white text-[#3C3322] border border-[#8B653F] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#a27457]/40 active:scale-95 transition-all cursor-pointer"
                onClick={handleDelete}
              >
                Delete Account
              </button>

            </div>
          </div>

        </div>

        {/* Right Panel */}
        <div className="mr-45">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default Setting;
