import React from 'react';

const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// BrowserRouter mock - just renders children
export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// MemoryRouter mock
export const MemoryRouter: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ children }) => (
  <>{children}</>
);

// Routes mock
export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

// Route mock
export const Route: React.FC<{ path?: string; element?: React.ReactNode; children?: React.ReactNode }> = ({ element, children }) => (
  <>{element || children}</>
);

// Link mock
export const Link: React.FC<{ to: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  to,
  children,
  className,
  style,
  ...props
}) => (
  <a href={to} className={className} style={style} {...props}>
    {children}
  </a>
);

// NavLink mock
export const NavLink: React.FC<{
  to: string;
  children: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string);
  style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties);
}> = ({
  to,
  children,
  className,
  style,
  ...props
}) => {
  const isActive = mockLocation.pathname === to;
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  const resolvedStyle = typeof style === 'function' ? style({ isActive }) : style;
  const resolvedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <a href={to} className={resolvedClassName} style={resolvedStyle} {...props}>
      {resolvedChildren}
    </a>
  );
};

// Navigate component mock
export const Navigate: React.FC<{ to: string; replace?: boolean }> = () => null;

// Outlet mock
export const Outlet: React.FC = () => null;

// useNavigate hook mock
export const useNavigate = () => mockNavigate;

// useLocation hook mock
export const useLocation = () => mockLocation;

// useParams hook mock
export const useParams = () => ({});

// useSearchParams hook mock
export const useSearchParams = () => {
  const searchParams = new URLSearchParams(mockLocation.search);
  const setSearchParams = jest.fn();
  return [searchParams, setSearchParams] as const;
};

// useMatch hook mock
export const useMatch = () => null;

// useRoutes hook mock
export const useRoutes = () => null;

// Helpers for tests to control navigation
export const __setMockLocation = (location: Partial<typeof mockLocation>) => {
  Object.assign(mockLocation, location);
};

export const __getMockNavigate = () => mockNavigate;

export const __resetMocks = () => {
  mockNavigate.mockReset();
  Object.assign(mockLocation, {
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  });
};
