import React from 'react'
import { Link } from 'react-router-dom'

const DashBoardPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Thống kê tổng quan */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Tổng số Chứng chỉ</h2>
          <p className="text-2xl font-bold">1,200</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Tổng số tài khoản</h2>
          <p className="text-2xl font-bold">800</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold">Chứng chỉ Mới Cấp</h2>
          <p className="text-2xl font-bold">50</p>
        </div>
      </section>

      {/* Danh sách chứng chỉ */}
      <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Danh sách Chứng chỉ mới cấp
        </h2>
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Tên người nhận</th>
              <th className="p-4 border-b">Tên Chứng chỉ</th>
              <th className="p-4 border-b">Ngày Cấp</th>
              <th className="p-4 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* Lặp qua danh sách chứng chỉ */}
            {[
              {
                id: '001',
                name: 'Nguyen Van A',
                certificate: 'Data Science',
                issuedDate: '2023-01-15'
              },
              {
                id: '002',
                name: 'Tran Thi B',
                certificate: 'Web Development',
                issuedDate: '2023-05-10'
              }
              // Các chứng chỉ khác
            ].map((cert) => (
              <tr key={cert.id}>
                <td className="p-4 border-b">{cert.id}</td>
                <td className="p-4 border-b">{cert.name}</td>
                <td className="p-4 border-b">{cert.certificate}</td>
                <td className="p-4 border-b">{cert.issuedDate}</td>
                <td className="p-4 border-b">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded">
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Các hành động khác */}
      <section className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Hành động</h2>
        <div className="flex space-x-4">
          <Link
            to={'/certificates'}
            className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
          >
            Thêm Chứng chỉ mới
          </Link>
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded">
            Xuất Báo Cáo
          </button>
        </div>
      </section>
    </div>
  )
}

export default DashBoardPage
