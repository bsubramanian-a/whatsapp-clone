import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import codes from 'country-calling-code';
import Input from '../blocks/Input';
import Dropdown from '../blocks/Dropdown';
import config from '../../config';
import axios from 'axios';
import * as bi from 'react-icons/bi';
import COtpInput from '../blocks/OtpInput';
function Register() {
  const [step, setStep] = useState(0);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [process, setProcess] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');

  const handleOtpChange = (otpValue) => {
    setOtp(otpValue);
  };

  useEffect(() => {
    const formatedData = codes.map((item) => ({
      ...item,
      label: item.country,
      value: item.country,
    }));
    setCountries(formatedData);
  }, []);

  const handleStep = () => {
    setStep(1);
  };

  const sendOTP = async () => {
    // console.log("phone number", phoneNumber, phoneCode);
    setError("");
    setSuccess("");
    if(!phoneNumber || !phoneCode){
      setError("Please fill all the fields!")
      return;
    }

    setProcess(true);

    try{
      let phone = phoneCode + phoneNumber;

      const {data} = await axios.post('/users/register', {phoneNumber: phone});
  
      // console.log("register response", data);
  
      setProcess(false);
  
      if(data?.statusCode == 200){
        setSuccess(data?.message);
        setUserId(data?.payload?.userId);
        setStep(2);
      }else{
        setError(data?.message);
      }
    } catch (err){
      setProcess(false);
      setError(err?.response?.data?.message)
    }
  };

  const handleCountry = (label) => {
    setCountry(countries.find((item) => item.label === label));
    setPhoneCode(
      countries.find((item) => item.label === label).countryCodes[0]
    );
  };

  const handlePhoneNumber = (e) => {
    setPhoneNumber(e.target.value);
  };

  const verifyOtp = async () => {
    console.log("otp", otp);
    try{
      const otpVerification = await axios.post('/users/verify', {otp, userId});

      console.log("otp verification", otpVerification);

      const response = otpVerification?.data
  
      if(response?.success){
        setSuccess(response?.message);
        localStorage.setItem('token', response?.payload?.token);
        localStorage.setItem(
          'cache',
          JSON.stringify({
            me: response?.payload?.user?.username || null,
          })
        );
  
        // reload this page after 1s
        setTimeout(() => {
          setProcess(false);
          window.location.reload();
        }, 1000);
      }else{
        setError(response?.message)
      }
    } catch(err){
      console.log("err", err);
      setError(err?.response?.data?.message);
    }
  }

  return (
    <div>
      {step === 0 && (
        <div>
          <Helmet>
            <title>{`Sign up - ${config.brandName}`}</title>
          </Helmet>
          {/* notice of terms */}
          <div className="mt-2 text-sm text-center text-[15px]">
            <p className="font-display text-spill-400">
              Read our&nbsp;
              <a href="/" className="text-sky-800 no-underline">
                Privacy Policy
              </a>
              . &nbsp; Tap &quot;Agree and Continue&quot;
            </p>
            <p className="text-center font-display text-spill-400">
              accept the&nbsp;
              <a href="/" className="text-sky-800 no-underline">
                Therms and Services
              </a>
            </p>
          </div>
          <button
            type="button"
            onClick={handleStep}
            className="mt-6 py-2 mx-auto px-14 w-fit flex justify-center font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <p>AGREE AND CONTINUE</p>
          </button>
          <div className="pt-4 pt-md-10">
            <p className="mt-4 text-center font-display text-spill-400">by</p>
            <p className="text-sky-800 text-center font-bold ">
              CHOC-CITY GROUP OF COMPANIES1
            </p>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="">
          <p className="font-display text-center text-spill-400 text-[20px]">
            Verify your phone number
          </p>
          <p className="font-display text-center my-4 text-spill-400 text-md text-[20px]">
            iMax will need to verify your account.
          </p>
          <div className="w-full">
            <Dropdown
              options={countries}
              value={country.label}
              onChange={handleCountry}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-1/3">
              <div className="border-b py-2 px-2 text-spill-300 border-emerald-600">
                + {phoneCode}
              </div>
            </div>
            <div className="w-2/3">
              <Input
                type="number"
                value={phoneNumber}
                onChange={handlePhoneNumber}
              />
            </div>
          </div>
          {error && <p style={{color: 'red'}} className='mt-2 text-center'>{error}</p>}
          <div className="mt-8">
            <button
              type="button"
              onClick={sendOTP}
              disabled={process}
              className="mt-6 py-2 mx-auto px-14 w-fit flex justify-center font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              {process ? (
                <i className="animate-spin">
                  <bi.BiLoaderAlt />
                </i>
              ) : (
                <p>Register</p>
              )}
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          {error && <p style={{color: 'red'}} className='mt-2 text-center'>{error}</p>}
          <COtpInput value={otp} onChange={handleOtpChange} />
          <div className="mt-8">
            <button
              type="button"
              onClick={verifyOtp}
              disabled={process}
              className="mt-6 py-2 mx-auto px-14 w-fit flex justify-center font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              {process ? (
                <i className="animate-spin">
                  <bi.BiLoaderAlt />
                </i>
              ) : (
                <p>Verify OTP</p>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
