import React, { useState, useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore.js';

const FriendPage = () => {
  const [selectedTab, setSelectedTab] = useState('friends');

  const {
    getFriend,
    getsentRequests,
    getpendingRequests,
    friends,
    sentRequests,
    pendingRequests
  } = useFriendStore();

  useEffect(() => {
    getFriend();
    getsentRequests();
    getpendingRequests();
  }, [getFriend, getsentRequests, getpendingRequests]);
 console.log(friends)
  const getButton = (type) => {
    switch (type) {
      case 'friend':
        return (
          <button className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">
            Xóa bạn
          </button>
        );
      case 'sent':
        return (
          <button className="w-full bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-sm">
            Hủy lời mời
          </button>
        );
      case 'pending':
        return (
          <button className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm">
            Chấp nhận
          </button>
        );
      default:
        return null;
    }
  };

  const renderCards = (list, type) => (
    <div className="h-screen">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        {list.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 w-56"
          >
            <div className="relative mb-3">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 transition-transform duration-300 hover:scale-105"
              />
            </div>

            <p className="font-semibold text-lg text-gray-800 mb-3">{user.fullName}</p>
            {getButton(type)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 ml-60">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý bạn bè</h1>

      <div className="flex justify-center mb-4 border-b border-gray-300">
        {[
          { key: 'friends', label: 'Bạn bè' },
          { key: 'sent', label: 'Đã gửi' },
          { key: 'pending', label: 'Chờ chấp nhận' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium ${
              selectedTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {selectedTab === 'friends' && renderCards(friends, 'friend')}
      {selectedTab === 'sent' && renderCards(sentRequests, 'sent')}
      {selectedTab === 'pending' && renderCards(pendingRequests, 'pending')}
    </div>
  );
};

export default FriendPage;
