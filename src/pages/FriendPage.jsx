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
    cancelSentRequest,
    sendFriendRequest,
    isLoadingFriend
  } = useFriendStore();

  useEffect(() => {
    getFriend();
    getsentRequests();
    getpendingRequests();
  }, [getFriend, getsentRequests, getpendingRequests]);

  const getButton = (user) => {
    const isFriend = friends.some(friend => friend.id === user.id);
    const isSentRequest = sentRequests.some(req => req.id === user.id);
    const isPendingRequest = pendingRequests.some(req => req.id === user.id);

    const handleRemove = async () => {
      await cancelSentRequest(user.id);
      await getpendingRequests();
    };
    const handleAction = async () => {
      try {
        if (isFriend) {
          await deleteFriend(user.id);
          await getFriend(); // Cập nhật lại danh sách bạn bè
        } else if (isSentRequest) {
          await cancelSentRequest(user.id);
          await getsentRequests(); // Cập nhật lại danh sách yêu cầu đã gửi
        } else if (isPendingRequest) {
          await acceptFriendRequest(user.id);
          await getpendingRequests(); // Cập nhật lại danh sách yêu cầu chờ chấp nhận
          await getFriend(); // Cập nhật lại danh sách bạn bè
        } else {
          await sendFriendRequest(user.id); // Gửi lời mời kết bạn
          await getsentRequests(); // Cập nhật lại danh sách yêu cầu đã gửi
        }
      } catch (error) {
        console.error("Lỗi xử lý hành động:", error);
      }
    };

    if (isFriend) {
      return (
        <button
          onClick={handleAction}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Xóa bạn
        </button>
      );
    } else if (isSentRequest) {
      return (
        <button
          onClick={handleAction}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
        >
          Hủy lời mời
        </button>
      );
    } else if (isPendingRequest) {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleAction}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Chấp nhận
          </button>
          <button
            onClick={handleRemove}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Gỡ yêu cầu
          </button>
        </div>
      );
    } else {
      return (
        <button
          onClick={handleAction}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Kết bạn
        </button>
      );
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      const result = await searchFriend(searchTerm);
      setSearchResult([result]); // Đảm bảo rằng kết quả là mảng, nếu không sẽ không render đúng
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
      setSearchResult([]);
    }
  };

  const renderCards = (list) => (
    <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
      {list.map((user) => (
        <div
          key={user.id}
          className="relative bg-base-200 rounded-2xl shadow-lg p-5 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300 w-50"
        >
          {isLoadingFriend && (
            <div className="absolute inset-0 z-20 rounded-2xl bg-base-100/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
              <div className="flex flex-col items-center gap-2">
              <span className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></span>
              <p className="text-sm text-base-content/70 animate-pulse">Đang xử lý...</p>
              </div>
            </div>
          )}


          <div>
            <div className="relative mb-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md hover:scale-110 transform transition-transform duration-300"
              />
              <span className="absolute bottom-2 right-6 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
            </div>

            <p className="font-bold text-lg text-base-300 mb-1">{user.fullName}</p>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>

            {getButton(user)}
          </div>
        </div>

      ))}
    </div>
  );
  const renderResultCards = (list) => (
    <div className="flex flex-col gap-4 mt-6 w-2/4 mx-auto">
      {list.map((user) => (
        <div
          key={user.id}
          className="bg-base-200 rounded-2xl shadow-lg p-4 flex items-center hover:shadow-2xl transition-all duration-300"
        >
          

          <div className="relative mr-4">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-md hover:scale-105 transform transition-transform duration-300"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
          </div>

          <div className="flex-1">
            <p className="font-bold text-lg text-base-content">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="ml-auto">
            {!isLoadingFriend? getButton(user):null}
          </div>
        </div>
      ))}
    </div>
  );


  return (
    <div className="ml-52 w-4/5   py-6  min-h-screen ">

      <div className="flex justify mb-1">
        <div className="flex shadow-md rounded overflow-hidden w-3/4 mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Nhập tên để tìm kiếm bạn bè..."
            className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition-all"
          >
            Tìm
          </button>
        </div>
      </div>

      {searchResult.length > 0 && (
        <div className="mb-5">
          {renderResultCards(searchResult)}
        </div>
      )}

      <div className="flex mb-4 border-b border-gray-300">
        {[{ key: 'friends', label: 'Bạn bè' }, { key: 'sent', label: 'Đã gửi' }, { key: 'pending', label: 'Chờ chấp nhận' }]
          .map((tab) => (
            <div
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`cursor-pointer px-4 py-2 text-sm font-medium ${selectedTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
                }`}
            >
              {tab.label}
            </div>
          ))}
      </div>

      {/* Danh sách theo tab */}
      {selectedTab === 'friends' && renderCards(friends)}
      {selectedTab === 'sent' && renderCards(sentRequests)}
      {selectedTab === 'pending' && renderCards(pendingRequests)}
    </div>
  );
};

export default FriendPage;
