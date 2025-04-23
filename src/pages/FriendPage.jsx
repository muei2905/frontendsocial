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
    sendFriendRequest
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

    const handleRemove = async()=>{
      await cancelSentRequest(user.id);
      await getpendingRequests(); 
    }
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
      // Người lạ: Hiển thị nút "Kết bạn"
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
          {getButton(user)} {/* Hiển thị nút phù hợp */}
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
          {renderCards(searchResult)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-4 border-b border-gray-300">
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
