import React from "react";
import Feed from "./Feed/Feed";
import SideBar from "./SideBar";
import Navbar from "./Navbar";
import RightPanel from "./RightPanel";

const MainScreen = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F0" }}>
      <Navbar />
      <div className="ml-[8vw]" style={{ display: "flex",  }}>
        <div>
          <SideBar />
        </div>
        <div className="ml-[1.5vw] w-[42.2vw]">
          <main style={{ flex: 1}}>
            <Feed />
          </main>
        </div>
        <div className="ml-[1.5vw]">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
