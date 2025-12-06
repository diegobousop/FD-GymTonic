import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import backend from '../../../../backend';
import Spinner from '../common/spinner';
import MyProfileTabSelector from './my-profile-tab-selector';

const BadgesList = ({ userId, activeTab, setActiveTab }) => {
    const [earnedBadges, setEarnedBadges] = useState(null);
    const [missingBadges, setMissingBadges] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        
        setLoading(true);
        // Fetch both in parallel
        Promise.all([
            new Promise((resolve, reject) => backend.badgeService.getEarnedBadges(userId, resolve, reject)),
            new Promise((resolve, reject) => backend.badgeService.getMissingBadges(userId, resolve, reject))
        ]).then(([earned, missing]) => {
            setEarnedBadges(earned);
            setMissingBadges(missing);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [userId]);

    if (loading) return <Spinner />;

    return (
        <div className="text-white">
            <MyProfileTabSelector 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                />


            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-10">
                {earnedBadges?.map(badge => (
                    <div key={badge.id} className="bg-[#262626] p-3 rounded-lg flex flex-col items-center text-center border border-[#990000]">
                         <div className="w-16 h-16 bg-[#990000] rounded-full mb-2 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            <span className="text-[10px] p-1">{badge.name.replaceAll('_', ' ')}</span>
                         </div>
                         <span className="font-bold text-sm mb-1">{badge.name.replaceAll('_', ' ')}</span>
                         <span className="text-[10px] text-gray-300">{badge.description}</span>
                         <span className="text-[10px] text-gray-400 mt-1">{new Date(badge.earnedDate).toLocaleDateString()}</span>
                    </div>
                ))}
                
                {missingBadges?.map(badge => (
                    <div key={badge.id} className="bg-[#1a1a1a] p-3 rounded-lg flex flex-col items-center text-center border border-gray-700 opacity-60 grayscale">
                        <div className="w-16 h-16 bg-gray-600 rounded-full mb-2 flex items-center justify-center text-white text-xs font-bold">
                            LOCK
                        </div>
                        <span className="font-bold text-sm mb-1">{badge.name.replaceAll('_', ' ')}</span>
                        <span className="text-[10px] text-gray-500">{badge.description}</span>
                    </div>
                ))}
            </div>
             {earnedBadges?.length === 0 && (!missingBadges || missingBadges.length === 0) && (
                 <p className="text-gray-500 italic">No badges info available.</p>
             )}
        </div>
    );
};

BadgesList.propTypes = {
    userId: PropTypes.number,
    activeTab: PropTypes.string,
    setActiveTab: PropTypes.func
};

export default BadgesList;


