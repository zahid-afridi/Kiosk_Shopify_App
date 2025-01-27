import React, { useState } from "react";

const TableComponent = ({ users }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 w-full">
      
      
      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-64  border-0 bg-white border-gray-300 mb-6 rounded-md focus:outline-none "
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-md mx-auto w-[90%] text-center flex  justify-center  rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full table-auto  border-collapse rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">#</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">User Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">User Email</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Reference Key</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 text-left">{index + 1}</td>
                  <td className="py-3 px-4 text-left">{user.name}</td>
                  <td className="py-3 px-4 text-left">{user.email}</td>
                  <td className="py-3 px-4 text-left">{user.referenceKey}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-3 px-4 text-center text-gray-500"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
