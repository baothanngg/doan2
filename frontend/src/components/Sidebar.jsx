import React, { createContext, useContext, useState } from 'react'
import logo from '../../public/logo.png'
import { ChevronFirst, ChevronLast, MoreVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import Avatar from 'react-avatar'

const SidebarContext = createContext()

const Sidebar = ({ children }) => {
  const [expanded, setExpanded] = useState(true)
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <aside className={`h-screen transition-all ${expanded ? 'w-64' : 'w-20'}`}>
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <Link
            to={'/'}
            className={`flex items-center p-1.5 justify-between gap-5 rounded-lg hover:bg-gray-100 ${
              expanded ? 'block' : 'hidden'
            }`}
          >
            <img
              src={logo}
              alt="Certificate"
              className={`overflow-hidden transition-all ${
                expanded ? 'w-8' : 'w-0'
              }`}
            />
            <h1
              className={`font-bold overflow-hidden transition-all ${
                expanded ? 'w-30' : 'w-0'
              }`}
            >
              Certificate
            </h1>
          </Link>
          <button
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            onClick={() => setExpanded((cur) => !cur)}
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          {/* <img src={logo} alt="" className="w-10 h-10 rounded-md" /> */}
          <Avatar
            name={user?.name}
            size="40"
            round={true}
            color={Avatar.getRandomColor('sitebase')}
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? 'w-52 ml-3' : 'w-0'
            } `}
          >
            <div>
              <h4 className="font-semibold">{user?.name}</h4>
              <span className="text-xs text-gray-600">{user?.email}</span>
            </div>
            {/* <MoreVertical size={20} /> */}
          </div>
        </div>
        {expanded ? (
          <div className={`border-t flex p-3 transition-all`}>
            <motion.button
              className=" w-full cursor-pointer p-4 text-white  font-bold rounded-lg shadow-lg transition duration-200 bg-yellow-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
            >
              Logout
            </motion.button>
          </div>
        ) : null}
      </nav>
    </aside>
  )
}

export default Sidebar

export const SidebarItem = ({ icon, text, active, alert, to }) => {
  const { expanded } = useContext(SidebarContext)
  return (
    <Link to={to}>
      <li
        className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer
    transition-transform hover:scale-110 ${
      active
        ? ' bg-indigo-300 text-indigo-900'
        : 'hover:bg-indigo-50 text-gray-600'
    }  group`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? 'ml-3 w-52' : 'w-0'
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
              expanded ? '' : 'top-2'
            } `}
          ></div>
        )}

        {!expanded && (
          <div
            className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 `}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  )
}
