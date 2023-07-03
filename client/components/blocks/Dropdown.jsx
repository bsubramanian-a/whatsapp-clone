import React, { useState, useEffect } from 'react';
import { RiArrowDownSFill } from 'react-icons/ri';

function Dropdown(props) {
  const { value, options, onChange } = props;

  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setCountry(value);
  }, [value]);

  const onChangeValue = (e) => {
    if (e.target.value) {
      setOpen(true);
    } else {
      setOpen(false);
    }
    setCountry(e.target.value);
    const filtered = options.filter((item) =>
      item.label.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setSelectedIndex(-1);
  };

  const onClick = (label) => {
    onChange(label);
    setOpen(false);
    setSelectedIndex(-1);
  };

  const onOpen = () => {
    setOpen((state) => !state);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1
      );
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault();
      onClick(filteredOptions[selectedIndex].value);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        onClick(filteredOptions[selectedIndex]);
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [selectedIndex, filteredOptions]);

  return (
    <div className="relative text-center w-full">
      <div
        onClick={onOpen}
        role="button"
        tabIndex="0"
        className="relative flex items-center justify-center gap-2 bg-transparent text-md px-3 py-2 border-b border-emerald-600 hover:border-blue-crayola focus:border-blue-crayola"
      >
        <input
          placeholder="Select country"
          onKeyDown={handleKeyDown}
          className="text-white text-center select-none"
          value={country}
          onChange={onChangeValue}
        />
        <RiArrowDownSFill className="absolute right-2 text-emerald-600 w-4 transition-all" />
      </div>
      {open &&
        (filteredOptions.length ? (
          <div className="absolute z-50 mt-2 w-full max-h-[200px] border border-spill-700 overflow-y-auto py-2 rounded bg-spill">
            {filteredOptions.map((item, index) => (
              <div
                role="button"
                tabIndex="0"
                key={item.label}
                onClick={() => onClick(item.label)}
                className={`${
                  selectedIndex === index ? 'bg-spill-700' : 'bg-spill-900'
                } flex justify-start items-center gap-2 py-1 px-3 hover:bg-spill-700`}
              >
                <div className="text-white text-md select-none">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div></div>
        ))}
    </div>
  );
}

export default Dropdown;
