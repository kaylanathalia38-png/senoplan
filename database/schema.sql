-- SENOPLAN DATABASE SCHEMA
-- Supabase PostgreSQL Schema for Real-time Betting Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Multi-user support)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    balance INTEGER DEFAULT 0,
    role TEXT DEFAULT 'player' CHECK (role IN ('admin', 'player')),
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BETTING ACTIVITIES (Real-time tracking)
CREATE TABLE betting_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    server_id TEXT NOT NULL CHECK (server_id IN ('server1', 'server2')),
    bet_amount INTEGER NOT NULL DEFAULT 0,
    bet_numbers JSONB DEFAULT '[]',
    bet_type TEXT CHECK (bet_type IN ('besar', 'kecil', 'genap', 'ganjil', 'number')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'win', 'lose', 'cancelled')),
    result_numbers JSONB DEFAULT '[]',
    win_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GAME TIMERS (Centralized timer state)
CREATE TABLE game_timers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    server_id TEXT UNIQUE NOT NULL CHECK (server_id IN ('server1', 'server2')),
    status TEXT DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'paused')),
    current_time INTEGER DEFAULT 0,
    max_time INTEGER DEFAULT 60,
    round_number INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAT MESSAGES (Real-time chat)
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    message TEXT,
    image_url TEXT,
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'admin', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WITHDRAWAL REQUESTS (Live admin notifications)
CREATE TABLE withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- BROADCASTS (Admin announcements)
CREATE TABLE broadcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- SERVER STATUS (Game control)
CREATE TABLE server_status (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    server_id TEXT UNIQUE NOT NULL CHECK (server_id IN ('server1', 'server2')),
    is_active BOOLEAN DEFAULT false,
    current_round INTEGER DEFAULT 0,
    next_result JSONB DEFAULT '[]',
    last_result JSONB DEFAULT '[]',
    total_bets INTEGER DEFAULT 0,
    total_players INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER SESSIONS (Track online users)
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GAME RESULTS (Historical data)
CREATE TABLE game_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    server_id TEXT NOT NULL CHECK (server_id IN ('server1', 'server2')),
    round_number INTEGER NOT NULL,
    winning_numbers JSONB NOT NULL DEFAULT '[]',
    total_bets INTEGER DEFAULT 0,
    total_winnings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_betting_activities_user_id ON betting_activities(user_id);
CREATE INDEX idx_betting_activities_server_id ON betting_activities(server_id);
CREATE INDEX idx_betting_activities_status ON betting_activities(status);
CREATE INDEX idx_betting_activities_created_at ON betting_activities(created_at);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_game_results_server_id ON game_results(server_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at);

-- TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_betting_activities_updated_at BEFORE UPDATE ON betting_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_server_status_updated_at BEFORE UPDATE ON server_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- COMMENTS
COMMENT ON TABLE users IS 'User accounts with role-based access';
COMMENT ON TABLE betting_activities IS 'All betting transactions and results';
COMMENT ON TABLE game_timers IS 'Real-time game timer synchronization';
COMMENT ON TABLE chat_messages IS 'Real-time chat system';
COMMENT ON TABLE withdrawal_requests IS 'User withdrawal requests for admin approval';
COMMENT ON TABLE broadcasts IS 'Admin announcements and notifications';
COMMENT ON TABLE server_status IS 'Game server control and status';
COMMENT ON TABLE user_sessions IS 'Active user session tracking';
COMMENT ON TABLE game_results IS 'Historical game results and statistics';
