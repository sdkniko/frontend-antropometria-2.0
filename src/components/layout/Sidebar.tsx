import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Drawer,
    Toolbar, // To offset content below app bar if needed
    Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person'; // For Profile
import EventNoteIcon from '@mui/icons-material/EventNote'; // Calendar icon
import StraightenIcon from '@mui/icons-material/Straighten';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PeopleIcon from '@mui/icons-material/People';

interface SidebarProps {
    drawerWidth: number;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    handleLogout: () => void; // Function to handle logout
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, handleDrawerToggle, handleLogout }) => {

    const drawerContent = (
        <div>
            <Toolbar /> {/* If using AppBar, provides spacing */} 
             <Box sx={{ p: 2 }}>
                <Typography variant="h6" noWrap component="div">
                    Your App Name
                </Typography>
            </Box>
            <Divider />
            <List>
                {/* Main Navigation */}
                <ListItemButton
                    component={RouterLink}
                    to="/dashboard"
                    selected={location.pathname === '/dashboard'}
                >
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton
                    component={RouterLink}
                    to="/calendar"
                    selected={location.pathname === '/calendar'}
                >
                    <ListItemIcon>
                        <EventNoteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Calendar" />
                </ListItemButton>
                <ListItemButton
                    component={RouterLink}
                    to="/health-data"
                    selected={location.pathname === '/health-data'}
                >
                    <ListItemIcon>
                        <FavoriteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Health Data" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/strava">
                    <ListItemIcon>
                        <DirectionsRunIcon />
                    </ListItemIcon>
                    <ListItemText primary="Strava Data" />
                </ListItemButton>
                {/* Commented out until components exist */}
                {/* <ListItemButton component={RouterLink} to="/reports"> 
                    <ListItemIcon>
                        <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton> */}
            </List>
            <Divider />
            <List>
                 {/* Profile & Settings */}
                 <ListItemButton component={RouterLink} to="/profile">
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                 {/* <ListItemButton component={RouterLink} to="/settings"> 
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemButton> */}
                <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Temporary Drawer for mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Permanent Drawer for desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar; 