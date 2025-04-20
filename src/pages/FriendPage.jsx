import React, { useState } from 'react'

const FriendPage = () => {
  const [selectedTab, setSelectedTab] = useState('all')

  const friends = [
    { id: 1, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1', type: 'friend' },
    { id: 2, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=2', type: 'friend' },
    { id: 3, name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=3', type: 'friend' },
  ]

  const sentRequests = [
    { id: 4, name: 'Phạm Minh D', avatar: 'https://i.pravatar.cc/150?img=4', type: 'sent' },
    { id: 5, name: 'Đỗ Thanh E', avatar: 'https://i.pravatar.cc/150?img=5', type: 'sent' },
  ]

  const pendingRequests = [
    { id: 6, name: 'Ngô Hoàng F', avatar: 'https://i.pravatar.cc/150?img=6', type: 'pending' },
    { id: 7, name: 'Huỳnh Mai G', avatar: 'https://i.pravatar.cc/150?img=7', type: 'pending' },
  ]

  const allUsers = [...friends, ...sentRequests, ...pendingRequests]

  const getButton = (type) => {
    switch (type) {
      case 'friend':
        return (
          <button className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">
            Xóa bạn
          </button>
        )
      case 'sent':
        return (
          <button className="w-full bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-sm">
            Hủy lời mời
          </button>
        )
      case 'pending':
        return (
          <button className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm">
            Chấp nhận
          </button>
        )
      default:
        return null
    }
  }

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
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 transition-transform duration-300 hover:scale-105"
            />
          </div>
  
          <p className="font-semibold text-lg text-gray-800 mb-3">{user.name}</p>
  
          {getButton(user.type)}
        </div>
      ))}
    </div>
  )
  
  
  return (
    <div className="max-w-6xl mx-auto p-6 ml-60">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý bạn bè</h1>

      <div className="flex justify-center mb-4 border-b border-gray-300">
        {[
          { key: 'all', label: 'Tất cả' },
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

      {selectedTab === 'all' && renderCards(allUsers)}
      {selectedTab === 'friends' && renderCards(friends)}
      {selectedTab === 'sent' && renderCards(sentRequests)}
      {selectedTab === 'pending' && renderCards(pendingRequests)}
    </div>
  )
}

export default FriendPage
