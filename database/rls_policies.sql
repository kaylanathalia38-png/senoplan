-- ROW LEVEL SECURITY (RLS) POLICIES FOR SENOPLAN
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- 1. USERS TABLE POLICIES
-- Allow public signups (handled by Supabase Auth)
CREATE POLICY "Allow public signups" ON users
    FOR INSERT WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can do anything with users
CREATE POLICY "Admins have full access to users" ON users
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- 2. BETTING ACTIVITIES POLICIES
-- Users can view their own bets
CREATE POLICY "Users can view own bets" ON betting_activities
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create new bets
CREATE POLICY "Users can create bets" ON betting_activities
    FOR INSERT WITH CHECK (true);

-- 3. CHAT MESSAGES POLICIES
-- Anyone can view messages
CREATE POLICY "Anyone can view chat messages" ON chat_messages
    FOR SELECT USING (true);

-- Users can send messages
CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. WITHDRAWAL REQUESTS POLICIES
-- Users can view their own withdrawal requests
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create withdrawal requests
CREATE POLICY "Users can create withdrawals" ON withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. GAME TIMERS POLICIES (read-only for all)
CREATE POLICY "Anyone can view game timers" ON game_timers
    FOR SELECT USING (true);

-- 6. SERVER STATUS POLICIES (read-only for all)
CREATE POLICY "Anyone can view server status" ON server_status
    FOR SELECT USING (true);

-- 7. GAME RESULTS POLICIES (read-only for all)
CREATE POLICY "Anyone can view game results" ON game_results
    FOR SELECT USING (true);

-- 8. BROADCASTS POLICIES (read-only for all)
CREATE POLICY "Anyone can view broadcasts" ON broadcasts
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- 9. USER SESSIONS POLICIES
-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own session
CREATE POLICY "Users can update own session" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. ADMIN-ONLY TABLES
-- Only admins can modify certain tables
CREATE POLICY "Only admins can modify server_status" ON server_status
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

CREATE POLICY "Only admins can modify game_timers" ON game_timers
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

CREATE POLICY "Only admins can modify broadcasts" ON broadcasts
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    ));

-- Enable realtime for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE server_status;
ALTER PUBLICATION supabase_realtime ADD TABLE game_timers;
ALTER PUBLICATION supabase_realtime ADD TABLE game_results;
ALTER PUBLICATION supabase_realtime ADD TABLE betting_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawal_requests;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM users
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies have been successfully applied';
    RAISE NOTICE 'Realtime has been enabled for chat_messages, server_status, game_timers, game_results, betting_activities, withdrawal_requests';
END $$;
