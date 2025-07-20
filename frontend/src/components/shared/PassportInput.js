import React from "react";

function passwordInput({label, placeholder,value,setValue}) {
  return (
    <div className="textInputDiv flex flex-col space-y-2 w-full ">
      <label  for={label} className="font-semibold text-gray-300"> 
        {label}
      </label>
      <input
        type="password"
        placeholder={placeholder}
        className="p-2 border border-gray-400 rounded placeholder-gray-600  "
        id={label}
        value={value}
        onChange={(e)=>{
           setValue(e.target.value)
        }}
      />
    </div>
  );
}

export default passwordInput;
