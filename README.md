# 🎰 SENOPLAN BETTING PLATFORM

Real-time betting platform dengan admin dan player dashboard.

## 🏗️ Architecture

```
senoplan/
├── admin-dashboard/     # Admin Dashboard (Netlify)
├── player-dashboard/    # Player Dashboard (Netlify)
├── database/           # Supabase Schema & Setup
└── docs/              # Documentation
```

## 🚀 Deployment

### Admin Dashboard
- **URL**: admin-senoplan.netlify.app
- **Login**: ID: 1111, Password: anakrumahan123
- **Features**: Real-time monitoring, user management, timer control

### Player Dashboard  
- **URL**: senoplan.netlify.app
- **Features**: Betting interface, real-time updates, chat

### Database
- **Platform**: Supabase Cloud
- **Features**: Real-time sync, authentication, RLS policies

## 🔧 Environment Variables

### Admin Dashboard
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Player Dashboard
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📱 Features

- ✅ Real-time betting system
- ✅ Multi-user support
- ✅ Admin monitoring dashboard
- ✅ Live chat system
- ✅ Withdrawal management
- ✅ Timer synchronization
- ✅ Mobile responsive

## 🎯 Existing UI Preserved

- Player: ID 4022, Saldo 990K, betting grid 0-9
- Admin: Login 1111/anakrumahan123
- Same colors, layouts, interactions
