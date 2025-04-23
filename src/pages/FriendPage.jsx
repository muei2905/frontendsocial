import React, { useState, useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore.js';

const FriendPage = () => {
  const [selectedTab, setSelectedTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState([]);

  const {
    getFriend,
    getsentRequests,
    getpendingRequests,
    friends,
    sentRequests,
    pendingRequests,
    searchFriend,
    deleteFriend,
    acceptFriendRequest,
    cancelSentRequest
  } = useFriendStore();

  useEffect(() => {
    getFriend();
    getsentRequests();
    getpendingRequests();
  }, [getFriend, getsentRequests, getpendingRequests]);

  const getButton = (type, userId) => {
    const handleAction = async () => {
      try {
        if (type === 'friend') {
          await deleteFriend(userId);
          await getFriend();
        } else if (type === 'sent') {
          await cancelSentRequest(userId);
          await getsentRequests();
        } else if (type === 'pending') {
          await acceptFriendRequest(userId);
          await getpendingRequests();
          await getFriend(); // cập nhật lại danh sách bạn bè mới
        }
      } catch (error) {
        console.error("Lỗi xử lý hành động:", error);
      }
    };

    const buttonConfig = {
      friend: {
        label: 'Xóa bạn',
        class: 'bg-red-500 hover:bg-red-600'
      },
      sent: {
        label: 'Hủy lời mời',
        class: 'bg-yellow-500 hover:bg-yellow-600'
      },
      pending: {
        label: 'Chấp nhận',
        class: 'bg-green-500 hover:bg-green-600'
      }
    };

    const config = buttonConfig[type];
    if (!config) return null;

    return (
      <button
        onClick={handleAction}
        className={`${config.class} text-white px-3 py-1 rounded text-sm`}
      >
        {config.label}
      </button>
    );
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      const result = await searchFriend(searchTerm);
      setSearchResult(result);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
      setSearchResult([]);
    }
  };

  const renderCards = (list, type) => (
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
          {getButton(type, user.id)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 ml-60">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý bạn bè</h1>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên để tìm kiếm bạn bè..."
          className="w-80 px-4 py-2 border rounded-l focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600"
        >
          Tìm
        </button>
      </div>

      {/* 🔽 Kết quả tìm kiếm */}
      {searchResult.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-center">Kết quả tìm kiếm</h2>
          {renderCards(searchResult, 'friend')}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-4 border-b border-gray-300">
        {[{ key: 'friends', label: 'Bạn bè' }, { key: 'sent', label: 'Đã gửi' }, { key: 'pending', label: 'Chờ chấp nhận' }]
          .map((tab) => (
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

      {/* Danh sách theo tab */}
      {selectedTab === 'friends' && renderCards(friends, 'friend')}
      {selectedTab === 'sent' && renderCards(sentRequests, 'sent')}
      {selectedTab === 'pending' && renderCards(pendingRequests, 'pending')}
    </div>
  );
};

export default FriendPage;
