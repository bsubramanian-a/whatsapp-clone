import React from 'react';
import OtpInput from 'react-otp-input';

const COtpInput = ({ value, onChange }) => {
    const inputStyle = {
        width: '2rem',
        height: '2rem',
        margin: '0.5rem',
        fontSize: '1.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        textAlign: 'center',
        color: '#fff'
      };
    
      const separatorStyle = {
        fontSize: '1.5rem',
        margin: '0 0.5rem',
        color: '#ccc',
      };

      
    return (
        <OtpInput
            containerStyle={{display: 'flex', justifyContent: 'center'}}
            value={value}
            onChange={onChange}
            numInputs={4} // Set the number of OTP digits to 4
            renderSeparator={<span style={separatorStyle}>-</span>} // Customize the separator between digits
            renderInput={(props) => <input {...props} />}
            inputStyle={inputStyle} // Customize the input style
        />
    );
};

export default COtpInput;
