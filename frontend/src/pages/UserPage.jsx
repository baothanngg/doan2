import { useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material'
import MUIDataTable from 'mui-datatables'
import { Link } from 'react-router-dom'
import Avatar from 'react-avatar'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

const UserPage = () => {
  const [users, setUsers] = useState([])
  const { token } = useAuthStore()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/auth/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        const usersWithId = response.data.users.map((user, index) => ({
          ...user,
          idx: index + 1
        }))
        setUsers(usersWithId)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [token])

  const handleToggleLock = async (userId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/auth/toggle-lock/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // Cập nhật lại danh sách người dùng sau khi khóa/mở khóa
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const usersWithId = response.data.users.map((user, index) => ({
        ...user,
        idx: index + 1
      }))
      setUsers(usersWithId)
    } catch (error) {
      console.error('Error toggling user lock:', error)
    }
  }

  const columns = [
    {
      name: '_id',
      label: 'IDD',
      options: { display: 'excluded', filter: false }
    },
    { name: 'idx', label: 'ID' },
    { name: 'name', label: 'Họ Tên' },
    { name: 'email', label: 'Email' },
    {
      name: 'image',
      label: 'Image',
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          const name = tableMeta.rowData[2] // Lấy tên từ cột thứ 2 (Họ Tên)
          return (
            <Avatar
              name={name}
              size="40"
              round={true}
              color={Avatar.getRandomColor('sitebase')}
            />
          )
        }
      }
    },
    {
      name: 'activity',
      label: 'Thời gian hoạt động',
      options: {
        customBodyRender: (value) => (
          <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${
              value === 'Đang hoạt động'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {value}
          </span>
        )
      }
    },
    {
      name: 'isLocked',
      label: 'Trạng thái',
      options: {
        customBodyRender: (value, tableMeta) => {
          const userId = tableMeta.rowData[0] // Lấy ID từ cột đầu tiên
          return (
            <button
              onClick={() => handleToggleLock(userId)}
              className={`px-3 py-1 rounded-full ${
                value ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {value ? 'Khóa' : 'Mở khóa'}
            </button>
          )
        }
      }
    }
  ]

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
    tableBodyHeight: '400px',
    tableBodyMaxHeight: '800px',
    scroll: true
  }

  const getMuiTheme = () =>
    createTheme({
      components: {
        MUIDataTable: {
          styleOverrides: {
            root: {
              border: '1px solid #cdcdcd'
            }
          }
        }
      }
    })

  return (
    <div className="flex flex-col h-fit p-8 ">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/users" className="hover:underline">
          Người dùng
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10/12 max-w-full overflow-auto">
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={'Danh sách tài khoản'}
              data={users}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </div>
      </div>
    </div>
  )
}

export default UserPage
