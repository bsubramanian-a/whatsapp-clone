import React, { useState } from 'react';
import * as comp from '../components/auth';
import '../public/assets/css/custom.css';
import myImage from '../public/assets/images/login-sign2.jpg';
import { useMediaQuery } from "react-responsive";

function Auth() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  console.log("isMobile", isMobile);
  const [respond, setRespond] = useState({ success: true, message: null });
  const [step, setStep] = useState(0);

  return (
    <div className="w-screen h-screen flex justify-center overflow-auto bg-spill sm:bg-spill custom-bg-sign">
      {(!isMobile || step == 0) && <h1 className="font-bold text-4xl text-white font-display text-center tracking-[.20em]">
        Welcome to iMax
      </h1>}
      <div className="md:container md:mx-auto p-6 w-[886px] grid-flow-row auto-rows-auto flex inner-sign-form">
        {(step == 0 || !isMobile) && <img src={myImage}
          alt=""
          className="rounded-full md:w-full w-[300px] md:basis-3/5 basis-auto md:h-full h-[300px] bg-cover md-5 mx-auto md:rounded-none justify-center"
        />}
        <div className="p-1 mt-2 p-md-6 mt-md-6 rounded-md flex flex-col justify-center bg-spill basis-2/5 gap-6">
          {/* header */}
          <div className="mb-4">
            {respond.message && (
              <p
                className={`${
                  !respond.success && 'text-rose-800'
                } text-sm mt-1`}
              >
                {respond.message}
              </p>
            )}
          </div>
          <comp.register step={step} setStep={setStep} setRespond={setRespond} />
        </div>
      </div>
    </div>
  );
}

export default Auth;
