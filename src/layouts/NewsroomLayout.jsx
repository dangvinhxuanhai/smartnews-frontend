import { NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export const newsroomMenus = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Tổng quan', path: '/dashboard' },
      { label: 'Articles', path: '/newsroom/articles', slug: 'articles' },
      { label: 'Stories', path: '/newsroom/stories', slug: 'stories' },
    ],
  },
  {
    title: 'CONTENT SOURCES',
    items: [
      {
        label: 'External Articles',
        path: '/newsroom/external-articles',
        slug: 'external-articles',
      },
      {
        label: 'External Sources',
        path: '/newsroom/sources',
        slug: 'sources',
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Users', path: '/newsroom/users', slug: 'users', adminOnly: true },
      { label: 'Categories', path: '/newsroom/categories', slug: 'categories', adminOnly: true },
      { label: 'Tags', path: '/newsroom/tags', slug: 'tags', adminOnly: true },
    ],
  },
]

export default function NewsroomLayout() {
  const { user } = useAuth()
  const location = useLocation()

  const currentPage = newsroomMenus
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname)

  return (
    <div className="newsroom-layout">
      <aside className="newsroom-sidebar">
        <div className="newsroom-sidebar-brand">
          <span className="newsroom-sidebar-logo">S</span>
          <div>
            <strong>SmartNews</strong>
            <small>CONTENT WORKSPACE</small>
          </div>
        </div>

        <nav aria-label="Newsroom navigation">
          {newsroomMenus.map((group) => {
            const items = group.items.filter(
              (item) => !item.adminOnly || user?.role === 'Admin'
            )

            if (items.length === 0) return null

            return (
              <div className="newsroom-nav-group" key={group.title}>
                <p>{group.title}</p>

                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `newsroom-nav-link ${isActive ? 'is-active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        <div className="newsroom-sidebar-bottom">
          <span className="newsroom-role">{user?.role}</span>
          <strong>{user?.name}</strong>
        </div>
      </aside>

      <div className="newsroom-main">
        <div className="newsroom-toolbar">
          <span>Newsroom / {currentPage?.label || 'Workspace'}</span>
          <span className="newsroom-toolbar-role">{user?.role}</span>
        </div>

        <Outlet />
      </div>
    </div>
  )
}