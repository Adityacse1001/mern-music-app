
function TextWithHover({displayText,active,onClick}) {
  return (
    <div className='flex items-center justify-start cursor-pointer' onClick={onClick}>
     
      <div className={`${!active ? 'text-gray-600' : 'text-white' } hover:text-white text-lg `}>
        {displayText}
      </div>
    </div>
  )
}

export default TextWithHover
