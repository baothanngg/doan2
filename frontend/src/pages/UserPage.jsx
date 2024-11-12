import { useEffect, useState } from 'react'
import { createTheme, ThemeProvider } from '@mui/material'
import MUIDataTable from 'mui-datatables'
import { Link } from 'react-router-dom'

const UserPage = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('https://dummyjson.com/users')
      .then((res) => res.json())
      .then((data) => (console.log(data), setUsers(data?.users)))
  }, [])

  const columns = [
    { name: 'id' },
    { name: 'firstName' },
    { name: 'age' },
    {
      name: 'gender',
      options: {
        customBodyRender: (value) => (
          <p
            className={`inline-flex justify-center items-center capitalize px-3 py-1 rounded-full ${
              value === 'male' ? 'bg-blue-500' : 'bg-pink-500'
            }`}
          >
            {value}
          </p>
        )
      }
    },
    {
      name: 'image',
      options: {
        customBodyRender: (value) => (
          <img
            src={value}
            alt="pic"
            className="w-12 h-12 rounded-full p-3 bg-slate-700"
          />
        )
      }
    }
  ]

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
    tableBodyHeight: '500px',
    tableBodyMaxHeight: '800px'
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
    <div className="flex flex-col h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/users" className="hover:underline">
          Users
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10/12 max-w-full overflow-auto">
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={'User List'}
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
