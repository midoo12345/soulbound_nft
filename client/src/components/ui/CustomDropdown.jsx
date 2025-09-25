import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  error = false,
  name,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Find selected option
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm(''); // Reset search when selecting
    if (onChange) {
      // Simulate native select event
      const event = {
        target: {
          name: name,
          value: option.value
        }
      };
      onChange(event);
    }
  };

  const toggleDropdown = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm(''); // Reset search when opening
      }
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled || loading}
        className={`w-full px-4 py-3 bg-cyan-900/40 text-left outline-none rounded-xl border-2 border-cyan-400/80 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 shadow-cyan-400/30 font-mono tracking-widest transition-all duration-200 backdrop-blur-md ${
          error 
            ? 'border-red-500 ring-2 ring-red-400' 
            : 'hover:bg-cyan-900/60 focus:bg-cyan-900/60'
        } ${
          disabled || loading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.25) 0%, rgba(14, 116, 144, 0.35) 100%)',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className={`text-cyan-100 ${!selectedOption ? 'opacity-70' : ''}`}>
            {loading ? 'Loading...' : (selectedOption ? selectedOption.label : placeholder)}
          </span>
          <div className="flex items-center space-x-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            )}
            <svg 
              className={`w-5 h-5 text-cyan-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && !loading && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Options Container */}
          <div 
            className="absolute z-20 w-full mt-2 bg-slate-800/95 backdrop-blur-md border border-cyan-400/30 rounded-xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-cyan-600">
              {/* Search input for large lists */}
              {options.length > 10 && (
                <div className="sticky top-0 p-3 border-b border-cyan-400/20 bg-slate-900/95 backdrop-blur-md">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full px-3 py-2 bg-slate-700/50 text-cyan-100 placeholder-cyan-300/50 border border-cyan-400/30 rounded-lg text-sm font-mono focus:outline-none focus:border-cyan-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-400 font-mono text-sm">
                  {searchTerm ? 'No courses found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-3 text-left font-mono tracking-wide transition-all duration-150 border-b border-cyan-400/10 last:border-b-0 ${
                      selectedOption?.value === option.value
                        ? 'bg-cyan-900/60 text-cyan-100 shadow-inner'
                        : 'text-cyan-200 hover:bg-cyan-900/40 hover:text-cyan-100'
                    } ${
                      index === 0 ? 'rounded-t-xl' : ''
                    } ${
                      index === filteredOptions.length - 1 ? 'rounded-b-xl' : ''
                    }`}
                    style={selectedOption?.value === option.value ? {
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)',
                      boxShadow: 'inset 0 2px 4px rgba(6, 182, 212, 0.2)'
                    } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {selectedOption?.value === option.value && (
                        <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDropdown;
