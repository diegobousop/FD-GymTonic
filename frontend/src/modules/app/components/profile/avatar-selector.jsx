import React from 'react'

const avatars = {
  'default': 'https://ik.imagekit.io/940wz34p7/icon1.png?updatedAt=1758634852371',
  'chainsaw': 'https://ik.imagekit.io/940wz34p7/icon3.png?updatedAt=1759057467622',
  'messy': 'https://ik.imagekit.io/940wz34p7/2.png?updatedAt=1759057348921',
  'surf': 'https://ik.imagekit.io/940wz34p7/icon4.png?updatedAt=1759058202678',
};

const AvatarSelector = ({ selectedAvatar, setSelectedAvatar }) => {
  return (
    <div className="flex flex-col mb-2">
        <p className=" text-[12px]">Avatares</p>
        <div className="grid grid-cols-2 gap-4">
            {Object.entries(avatars).map(([key, url]) => (
                <div key={key} className="flex flex-col">
                    <img 
                        src={url} 
                        alt={key} 
                        className={`w-[134px] h-[134px] border-2 cursor-pointer ${
                            selectedAvatar === key 
                                ? 'border-white' 
                                : 'border-transparent hover:border-red-500'
                        }`}
                        onClick={() => setSelectedAvatar(key)} 
                    />
                </div>
            ))}
        </div>
    </div>
  )
}

export default AvatarSelector