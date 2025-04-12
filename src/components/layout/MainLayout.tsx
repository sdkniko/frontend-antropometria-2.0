import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assessment,
  FitnessCenter,
  HealthAndSafety,
  Description,
  ExitToApp,
  Add,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'Patients',
      icon: <People />,
      path: '/patients',
      role: 'professional',
    },
    {
      text: 'Measurements',
      icon: <Assessment />,
      path: '/measurements',
    },
    {
      text: 'Performance',
      icon: <FitnessCenter />,
      path: '/performance',
    },
    {
      text: 'Health',
      icon: <HealthAndSafety />,
      path: '/health',
    },
    {
      text: 'Reports',
      icon: <Description />,
      path: '/reports',
    },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {user?.role === 'professional' ? 'Professional Dashboard' : 'Athlete Dashboard'}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          if (item.role && item.role !== user?.role) return null;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user?.role === 'professional' && (
              <>
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  onClick={() => navigate('/measurements/new')}
                >
                  Add Measurement
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  onClick={() => navigate('/patients/new')}
                >
                  Add Patient
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Add />}
                  onClick={() => navigate('/performance/new')}
                >
                  Add Performance
                </Button>
              </>
            )}
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => navigate('/health/new')}
            >
              Add Health Metrics
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 