import React from 'react';
import { Icon } from "@iconify/react";
import { Link } from 'react-router-dom';

function IconText({ iconName, displayText, active, target, onClick }) {
  return (
    <Link to={target} className="block">
      <div
        className={`flex items-center justify-start cursor-pointer py-3 px-5 rounded 
                    ${active ? 'text-white' : 'text-gray-600'} 
                    hover:text-white`}
        onClick={onClick}
      >
        <Icon icon={iconName} width="24" className="mr-3" fontSize={23} />
        <span>{displayText}</span>
      </div>
    </Link>
  );
}

export default IconText;
