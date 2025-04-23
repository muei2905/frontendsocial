import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

const SearchFriends = ({ authUser, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState(""); // State để lưu query tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // State để lưu kết quả tìm kiếm

  // Tìm kiếm bạn bè khi searchQuery thay đổi
  useEffect(() => {
    const searchFriends = async () => {
      if (!searchQuery || !authUser || !authUser.jwt) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/friendships/search?name=${searchQuery}`, {
          headers: { Authorization: `Bearer ${authUser.jwt}` },
        });
        setSearchResults(response.data);
        console.log("Search results:", response.data);
      } catch (error) {
        console.error("Error searching friends:", error);
        setSearchResults([]);
      }
    };

    searchFriends();
  }, [searchQuery, authUser]);

  // Xử lý khi người dùng nhấp vào một kết quả tìm kiếm
  const handleSelectUser = (user) => {
    console.log("Selected search user:", user);
    onSelectUser({
      userId: user.id,
      fullName: user.fullName,
      avatar: user.avatar || user.avatarUrl || "/avatar.png", // Chuẩn hóa
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="mb-6 relative">
      <input
        type="text"
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-3 rounded-lg bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      {/* Box gợi ý tìm kiếm */}
      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-neutral-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="flex items-center gap-4 p-3 hover:bg-neutral-700 cursor-pointer transition-colors duration-200"
            >
              <img
                src={user.avatar || "/avatar.png"}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover shadow-md"
              />
              <div>
                <p className="font-medium text-white">{user.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFriends;