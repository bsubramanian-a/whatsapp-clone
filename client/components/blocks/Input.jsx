import React from 'react';

function Input(props) {
  const {
    name,
    type,
    value,
    placeholder,
    disabled,
    onChange,
    onKeyDown,
    onBlur,
  } = props;

  return (
    <input
      className="relative border-b border-emerald-600 outline-none bg-transparent py-2 px-4 w-full font-sm text-spill-300 focus:outline-none"
      type={type}
      name={name}
      min={0}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    />
  );
}

export default Input;
